import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, CheckCircle, XCircle, Camera } from 'lucide-react';
import api from '../api/axios';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [shouldStartScanner, setShouldStartScanner] = useState(false);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Initialize scanner when element is ready
  useEffect(() => {
    if (shouldStartScanner && scanning) {
      initializeScanner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldStartScanner, scanning]);

  const waitForElement = async (elementId, maxAttempts = 20) => {
    for (let i = 0; i < maxAttempts; i++) {
      const element = document.getElementById(elementId);
      if (element) {
        return element;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return null;
  };

  const initializeScanner = async () => {
    try {
      // Wait for the element to be available in DOM
      const qrReaderElement = await waitForElement("qr-reader");
      
      if (!qrReaderElement) {
        setError("QR reader element not found. Please try again.");
        setScanning(false);
        setShouldStartScanner(false);
        return;
      }
      
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          await handleScan(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Ignore scanning errors
        }
      );

      setShouldStartScanner(false);
    } catch (err) {
      console.error("Camera error:", err);
      setScanning(false);
      setShouldStartScanner(false);
      
      // Provide detailed error message based on error type
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Camera access denied. Please allow camera permissions in your browser settings.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError("No camera found. Please connect a camera or use manual entry below.");
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError("Camera is in use by another application. Please close other apps using the camera.");
      } else if (err.name === 'OverconstrainedError') {
        setError("Camera constraints not supported. Trying fallback...");
        tryFallbackCamera();
      } else {
        setError("Failed to start camera: " + err.message + ". Please use manual entry.");
      }
    }
  };

  const startScanning = () => {
    setError(null);
    setResult(null);
    setScanning(true);
    setShouldStartScanner(true);
  };

  const tryFallbackCamera = async () => {
    try {
      const qrReaderElement = await waitForElement("qr-reader");
      
      if (!qrReaderElement) {
        setError("QR reader element not found. Please use manual entry below.");
        setScanning(false);
        return;
      }
      
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      // Try with simpler constraints
      await html5QrCode.start(
        { facingMode: "user" }, // Try front camera
        {
          fps: 10,
          qrbox: 250
        },
        async (decodedText) => {
          await handleScan(decodedText);
          stopScanning();
        }
      );

      setError(null);
    } catch (err) {
      console.error("Fallback camera error:", err);
      setError("Camera initialization failed. Please use manual entry below.");
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      }
      setScanning(false);
    } catch (err) {
      console.error("Error stopping scanner:", err);
    }
  };

  const handleScan = async (data) => {
    try {
      let parsedData;
      
      try {
        parsedData = JSON.parse(data);
      } catch {
        parsedData = { passCode: data };
      }

      // Check in visitor
      const response = await api.post('/checklog/checkin', {
        passCode: parsedData.passCode
      });

      setResult({
        success: true,
        message: response.data.message,
        data: response.data
      });
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || 'Invalid QR code'
      });
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    
    await handleScan(manualCode);
    setManualCode('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Scanner</h1>
        <p className="text-gray-500 mt-1">Scan visitor passes for check-in</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Camera Scanner
          </h3>

          {/* Scanner Display */}
          <div className="mb-4">
            {!scanning ? (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Camera not active</p>
                  <button
                    onClick={startScanning}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition inline-flex items-center gap-2"
                  >
                    <QrCode className="w-5 h-5" />
                    Start Scanning
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
                <button
                  onClick={stopScanning}
                  className="w-full mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Stop Scanning
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800 mb-2">{error}</p>
                  <div className="text-xs text-red-700 space-y-1">
                    <p className="font-semibold">To enable camera access:</p>
                    <ul className="list-disc ml-4 space-y-0.5">
                      <li><strong>Chrome/Edge:</strong> Click the lock icon in address bar → Camera → Allow</li>
                      <li><strong>Firefox:</strong> Click the shield icon → Permissions → Camera → Allow</li>
                      <li><strong>Safari:</strong> Safari menu → Settings → Websites → Camera → Allow</li>
                    </ul>
                    <p className="mt-2">After enabling, refresh the page and try again.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Manual Entry & Result Section */}
        <div className="space-y-6">
          {/* Manual Entry */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Manual Entry
            </h3>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pass Code
                </label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter pass code manually"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
              >
                Submit Pass Code
              </button>
            </form>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`rounded-xl shadow-sm p-6 border ${
              result.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold mb-2 ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.success ? 'Check-in Successful!' : 'Check-in Failed'}
                  </h4>
                  <p className={`text-sm ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.message}
                  </p>
                  
                  {result.success && result.data?.log && (
                    <div className="mt-4 pt-4 border-t border-green-200 space-y-2">
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Visitor:</span>{' '}
                        {result.data.log.visitor?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Time:</span>{' '}
                        {new Date(result.data.log.checkInTime).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
