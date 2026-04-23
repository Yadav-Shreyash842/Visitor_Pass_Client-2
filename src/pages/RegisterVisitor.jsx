import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, FileText, Upload, AlertCircle, CheckCircle, RefreshCw, Calendar, Clock, ArrowRight, X } from 'lucide-react';
import api from '../api/axios';

const STATUS_COLORS = {
  pending:      'bg-yellow-100 text-yellow-800',
  approved:     'bg-green-100 text-green-800',
  rejected:     'bg-red-100 text-red-800',
  'checked-in': 'bg-blue-100 text-blue-800',
  'checked-out':'bg-gray-100 text-gray-800',
};

const STATUS_LABELS = {
  pending:      'Pending Approval',
  approved:     'Approved',
  rejected:     'Rejected',
  'checked-in': 'Currently Inside',
  'checked-out':'Visit Completed',
};

// ─── Step 1: Phone entry screen ───────────────────────────────────────────────
const PhoneStep = ({ onFound, onNotFound }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (phone.trim().length < 7) { setError('Enter a valid phone number'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.get(`/visitors/lookup?phone=${encodeURIComponent(phone.trim())}`);
      if (res.data.found) {
        onFound(res.data.visitor, phone.trim());
      } else {
        onNotFound(phone.trim());
      }
    } catch {
      setError('Could not check number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Visitor Check-In</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your phone number to get started</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleCheck} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              autoFocus
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-base"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><ArrowRight className="w-5 h-5" /> Continue</>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

// ─── Step 2a: Returning visitor identity confirm ──────────────────────────────
const ReturningVisitorCard = ({ visitor, phone, onConfirm, onNotMe }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-white" />
          <div>
            <p className="text-white font-bold">Returning Visitor Detected</p>
            <p className="text-blue-200 text-xs">Phone number matches an existing record</p>
          </div>
        </div>

        {/* Visitor identity card */}
        <div className="p-6">
          <div className="flex items-center gap-5 mb-6">
            {/* Big photo */}
            {visitor.photo ? (
              <img
                src={visitor.photo}
                alt={visitor.name}
                className="w-24 h-24 rounded-2xl object-cover border-3 border-blue-200 shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User className="w-12 h-12 text-blue-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-gray-900 leading-tight">{visitor.name}</p>
              <p className="text-gray-500 text-sm mt-0.5">{visitor.email}</p>
              <p className="text-gray-500 text-sm">{visitor.phone}</p>
            </div>
          </div>

          {/* Last visit details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Last Visit Details</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[visitor.status]}`}>
                {STATUS_LABELS[visitor.status] || visitor.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Purpose
              </span>
              <span className="text-sm font-medium text-gray-900 text-right max-w-[180px] truncate">{visitor.purpose}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Host
              </span>
              <span className="text-sm font-medium text-gray-900">{visitor.host || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Date
              </span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(visitor.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Confirm question */}
          <p className="text-center text-gray-700 font-medium mb-4">Is this you?</p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onNotMe}
              className="py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Not Me
            </button>
            <button
              onClick={() => onConfirm(visitor)}
              className="py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Yes, It's Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Step 2b / 3: Registration form (new or returning) ───────────────────────
const VisitorForm = ({ phone, prefill, isReturning, onDone }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(prefill?.photo || null);
  const [formData, setFormData] = useState({
    name:    prefill?.name    || '',
    email:   prefill?.email   || '',
    phone:   phone            || '',
    purpose: '',   // always fresh for new visit
    host:    '',
    photo:   prefill?.photo   || '',
  });

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) { setError('JPEG, PNG or GIF only'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Photo must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setFormData(p => ({ ...p, photo: reader.result })); setPhotoPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/visitors/createVisitor', formData);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isReturning ? 'New Visit Request' : 'Visitor Registration'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isReturning ? 'Fill in the details for your new visit' : 'Fill in your details to register'}
          </p>
        </div>

        {isReturning && (
          <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-700">Your personal details are pre-filled. Just update purpose and host.</p>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
              <input
                type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="John Doe" required
                disabled={isReturning}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="john@example.com" required
                disabled={isReturning}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
              <input
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="+91 98765 43210" required
                disabled={isReturning}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Host */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Host Name *</label>
              <input
                type="text" name="host" value={formData.host} onChange={handleChange}
                placeholder="Person you're visiting" required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose of Visit *</label>
            <textarea
              name="purpose" value={formData.purpose} onChange={handleChange}
              placeholder="Meeting, Interview, Delivery, etc."
              rows="2" required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Your Photo {!isReturning && '*'}
            </label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-primary-300 flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50">
                  <User className="w-8 h-8 text-gray-300" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file" accept="image/jpeg,image/png,image/gif"
                  onChange={handlePhoto}
                  required={!formData.photo}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {isReturning ? 'Upload new photo or keep existing' : 'JPEG, PNG, GIF — max 5MB'}
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-semibold disabled:opacity-50 mt-2"
          >
            {loading ? 'Submitting...' : isReturning ? 'Submit Visit Request' : 'Submit Registration'}
          </button>

          <p className="text-center text-xs text-gray-400">
            Your request will be reviewed by security/admin before approval
          </p>
        </form>
      </div>
    </div>
  );
};

// ─── Step 4: Done screen ──────────────────────────────────────────────────────
const DoneScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
      <p className="text-gray-600 mb-2">Your visit request has been submitted successfully.</p>
      <p className="text-sm text-gray-500 mb-6">
        Security or admin will review and approve your request. You'll receive an email notification.
      </p>
      <Link
        to="/login"
        className="inline-block w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition"
      >
        Go to Login
      </Link>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const RegisterVisitor = () => {
  // step: 'phone' | 'returning_confirm' | 'form' | 'done'
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [returningVisitor, setReturningVisitor] = useState(null);
  const [isReturning, setIsReturning] = useState(false);
  const [prefill, setPrefill] = useState(null);

  const handleFound = (visitor, ph) => {
    setPhone(ph);
    setReturningVisitor(visitor);
    setStep('returning_confirm');
  };

  const handleNotFound = (ph) => {
    setPhone(ph);
    setIsReturning(false);
    setPrefill(null);
    setStep('form');
  };

  const handleConfirmIdentity = (visitor) => {
    // They confirmed it's them — pre-fill form, mark as returning
    setIsReturning(true);
    setPrefill(visitor);
    setStep('form');
  };

  const handleNotMe = () => {
    // Different person with same phone — treat as new visitor
    setIsReturning(false);
    setPrefill(null);
    setStep('form');
  };

  if (step === 'phone')
    return <PhoneStep onFound={handleFound} onNotFound={handleNotFound} />;

  if (step === 'returning_confirm')
    return (
      <ReturningVisitorCard
        visitor={returningVisitor}
        phone={phone}
        onConfirm={handleConfirmIdentity}
        onNotMe={handleNotMe}
      />
    );

  if (step === 'form')
    return (
      <VisitorForm
        phone={phone}
        prefill={prefill}
        isReturning={isReturning}
        onDone={() => setStep('done')}
      />
    );

  return <DoneScreen />;
};

export default RegisterVisitor;
