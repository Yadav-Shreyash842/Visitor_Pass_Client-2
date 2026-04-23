import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Camera, User, Shield, KeyRound, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import api from '../api/axios';

// ─── Shared result display ────────────────────────────────────────────────────
const ResultScreen = ({ result, onReset }) => {
  if (!result) return null;
  return (
    <div className={`rounded-2xl overflow-hidden shadow-xl border-4 ${result.success ? 'border-green-400' : 'border-red-400'}`}>
      {result.success && result.visitor ? (
        <div className="bg-white">
          <div className="bg-green-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-white" />
              <span className="text-white font-bold text-xl tracking-wide">ACCESS GRANTED</span>
            </div>
            <button onClick={onReset} className="text-white/80 hover:text-white text-sm underline">
              Scan Next
            </button>
          </div>
          <div className="p-8 flex flex-col items-center gap-5">
            {result.visitor.photo ? (
              <img
                src={result.visitor.photo}
                alt={result.visitor.name}
                className="w-56 h-56 rounded-2xl object-cover border-4 border-green-300 shadow-lg"
              />
            ) : (
              <div className="w-56 h-56 rounded-2xl bg-gray-100 border-4 border-green-300 flex items-center justify-center">
                <User className="w-28 h-28 text-gray-300" />
              </div>
            )}
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{result.visitor.name}</p>
              {result.visitor.phone && <p className="text-gray-500 text-lg mt-1">{result.visitor.phone}</p>}
            </div>
            <p className="text-green-700 font-medium bg-green-50 border border-green-200 rounded-xl px-5 py-2 text-sm">
              ✓ Checked in at {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-14 h-14 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-700 mb-3">ACCESS DENIED</p>
          <p className="text-red-600 text-lg">{result.message}</p>
          <button
            onClick={onReset}
            className="mt-6 px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

// ─── NORMAL MODE — watchman enters pass code, sees photo to confirm ───────────
const NormalMode = ({ onResult }) => {
  const [passCode, setPassCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passCode.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/checklog/checkin', { passCode: passCode.trim(), otpVerified: false });
      onResult({ success: true, visitor: res.data.visitor, message: res.data.message });
    } catch (err) {
      onResult({ success: false, message: err.response?.data?.message || 'Invalid pass' });
    } finally {
      setLoading(false);
      setPassCode('');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Mode indicator */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-blue-800">Normal Entry Mode — No special event active</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Enter Pass Code</h3>
        <p className="text-sm text-gray-500 mb-5">Visitor shows their pass code — enter it below to confirm entry</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={passCode}
            onChange={e => setPassCode(e.target.value)}
            placeholder="Paste or type visitor pass code"
            autoFocus
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 font-mono text-base"
          />
          <button
            type="submit"
            disabled={loading || !passCode.trim()}
            className="w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-semibold text-base disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Confirm Entry'}
          </button>
        </form>
      </div>

      {/* Watchman guide */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-800 mb-2">Watchman Guide</p>
        <ul className="text-sm text-amber-700 space-y-1.5">
          <li>1. Ask visitor to show their pass (phone or printout)</li>
          <li>2. Type the pass code shown on their pass</li>
          <li>3. <strong>Green screen</strong> → confirm face matches photo → allow entry</li>
          <li>4. <strong>Red screen</strong> → deny entry, call security</li>
        </ul>
      </div>
    </div>
  );
};

// ─── SPECIAL EVENT MODE — QR scan + OTP required ─────────────────────────────
const SpecialEventMode = ({ event, onResult }) => {
  const [stage, setStage] = useState('scan'); // 'scan' | 'otp'
  const [scanning, setScanning] = useState(false);
  const [shouldStart, setShouldStart] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [camError, setCamError] = useState('');
  const html5QrRef = useRef(null);

  useEffect(() => () => { html5QrRef.current?.stop().catch(() => {}); }, []);
  useEffect(() => { if (shouldStart && scanning) initCam(); }, [shouldStart, scanning]);

  const waitForEl = async (id, tries = 20) => {
    for (let i = 0; i < tries; i++) {
      if (document.getElementById(id)) return true;
      await new Promise(r => setTimeout(r, 60));
    }
    return false;
  };

  const initCam = async () => {
    const found = await waitForEl('event-qr-reader');
    if (!found) { setCamError('Camera element not ready. Use manual entry.'); setScanning(false); setShouldStart(false); return; }
    try {
      const qr = new Html5Qrcode('event-qr-reader');
      html5QrRef.current = qr;
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (text) => { stopCam(); handleCodeScanned(text); },
        () => {}
      );
      setShouldStart(false);
    } catch (err) {
      setScanning(false); setShouldStart(false);
      if (err.name === 'NotAllowedError') setCamError('Camera access denied. Use manual entry.');
      else if (err.name === 'NotFoundError') setCamError('No camera found. Use manual entry.');
      else setCamError('Camera error: ' + err.message);
    }
  };

  const stopCam = async () => {
    try { await html5QrRef.current?.stop(); html5QrRef.current = null; } catch {}
    setScanning(false);
  };

  const handleCodeScanned = (text) => {
    let code;
    try { code = JSON.parse(text).passCode; } catch { code = text; }
    setScannedCode(code);
    setStage('otp');
  };

  const handleManualCode = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCodeScanned(manualCode.trim());
    setManualCode('');
  };

  const handleSendOTP = async () => {
    if (!visitorEmail) return;
    setOtpLoading(true);
    try {
      await api.post('/visitors/send-otp', { email: visitorEmail, phone: visitorPhone });
      setOtpSent(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyAndCheckIn = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setOtpLoading(true);
    try {
      // 1. Verify OTP
      const key = visitorPhone || visitorEmail;
      const otpRes = await api.post('/visitors/verify-otp', { key, otp: otp.trim() });
      if (!otpRes.data.valid) { alert('Invalid OTP'); setOtpLoading(false); return; }

      // 2. Check in with otpVerified = true
      const res = await api.post('/checklog/checkin', { passCode: scannedCode, otpVerified: true });
      onResult({ success: true, visitor: res.data.visitor, message: res.data.message });
    } catch (err) {
      onResult({ success: false, message: err.response?.data?.message || 'Check-in failed' });
    } finally {
      setOtpLoading(false);
    }
  };

  const resetToScan = () => { setStage('scan'); setScannedCode(''); setOtp(''); setOtpSent(false); setVisitorEmail(''); setVisitorPhone(''); };

  return (
    <div className="max-w-md mx-auto space-y-5">
      {/* Event banner */}
      <div className="bg-purple-600 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-md">
        <Shield className="w-6 h-6 text-white flex-shrink-0" />
        <div>
          <p className="text-white font-bold text-base">Special Event Active</p>
          <p className="text-purple-200 text-sm">{event.name} — QR + OTP required for entry</p>
        </div>
      </div>

      {stage === 'scan' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Step 1 — Scan Visitor QR Code</h3>
            <p className="text-sm text-gray-500 mt-1">Scan the QR code from visitor's pass</p>
          </div>

          {!scanning ? (
            <div className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-purple-200">
              <QrCode className="w-14 h-14 text-purple-300 mb-3" />
              <p className="text-gray-400 text-sm mb-4">Camera not active</p>
              <button
                onClick={() => { setCamError(''); setScanning(true); setShouldStart(true); }}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition flex items-center gap-2 font-medium"
              >
                <Camera className="w-4 h-4" />
                Start Camera
              </button>
            </div>
          ) : (
            <div>
              <div id="event-qr-reader" className="rounded-xl overflow-hidden" />
              <button onClick={stopCam} className="w-full mt-3 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium">
                Stop Camera
              </button>
            </div>
          )}

          {camError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{camError}</p>}

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Or enter pass code manually:</p>
            <form onSubmit={handleManualCode} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                placeholder="Pass code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                Next
              </button>
            </form>
          </div>
        </div>
      )}

      {stage === 'otp' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Step 2 — OTP Verification</h3>
              <p className="text-sm text-gray-500 mt-0.5">Pass code received. Now verify visitor identity via OTP.</p>
            </div>
            <button onClick={resetToScan} className="text-xs text-gray-400 hover:text-gray-600 underline">
              ← Back
            </button>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
            <p className="text-xs text-purple-600 font-medium">Pass Code</p>
            <p className="text-sm font-mono text-purple-900 mt-0.5 break-all">{scannedCode}</p>
          </div>

          <form onSubmit={handleVerifyAndCheckIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Visitor Email</label>
              <input
                type="email"
                value={visitorEmail}
                onChange={e => setVisitorEmail(e.target.value)}
                placeholder="visitor@email.com"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Visitor Phone (optional)</label>
              <input
                type="tel"
                value={visitorPhone}
                onChange={e => setVisitorPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={otpLoading || !visitorEmail}
                className="w-full py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                {otpLoading ? 'Sending...' : 'Send OTP to Visitor Email'}
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    maxLength={6}
                    required
                    autoFocus
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500 font-mono text-2xl text-center tracking-widest"
                  />
                  <button type="button" onClick={handleSendOTP} disabled={otpLoading} className="text-xs text-purple-500 hover:underline mt-1">
                    Resend OTP
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={otpLoading || !otp.trim()}
                  className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold text-base disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${otpLoading ? 'animate-spin' : ''}`} />
                  {otpLoading ? 'Verifying...' : 'Verify OTP & Check In'}
                </button>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

// ─── Main QRScanner page ──────────────────────────────────────────────────────
const QRScanner = () => {
  const [activeEvent, setActiveEvent] = useState(null);   // null = loading, false = no event, object = event
  const [eventLoading, setEventLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get('/events/active')
      .then(res => setActiveEvent(res.data.active ? res.data.event : false))
      .catch(() => setActiveEvent(false))
      .finally(() => setEventLoading(false));
  }, []);

  const reset = () => setResult(null);

  if (eventLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Entry Scanner</h1>
        <p className="text-gray-500 mt-1">
          {activeEvent ? `Special event mode — ${activeEvent.name}` : 'Normal entry mode'}
        </p>
      </div>

      {result ? (
        <ResultScreen result={result} onReset={reset} />
      ) : activeEvent ? (
        <SpecialEventMode event={activeEvent} onResult={setResult} />
      ) : (
        <NormalMode onResult={setResult} />
      )}
    </div>
  );
};

export default QRScanner;
