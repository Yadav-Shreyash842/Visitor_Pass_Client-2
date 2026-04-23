import { useState, useEffect, useRef } from 'react';
import { User, Phone, FileText, Upload, CheckCircle, AlertCircle, Clock, UserCheck, UserX, RefreshCw, LogOut, Camera } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  pending:      'bg-yellow-100 text-yellow-800 border border-yellow-200',
  approved:     'bg-green-100 text-green-800 border border-green-200',
  rejected:     'bg-red-100 text-red-800 border border-red-200',
  'checked-in': 'bg-blue-100 text-blue-800 border border-blue-200',
  'checked-out':'bg-gray-100 text-gray-700 border border-gray-200',
};

const EMPTY_FORM = { name: '', phone: '', email: '', purpose: '', host: '', photo: '' };

const WatchmanDashboard = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData]     = useState(EMPTY_FORM);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage]       = useState(null); // { type: 'success'|'error', text }
  const [visitors, setVisitors]     = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [returningBanner, setReturningBanner] = useState(null); // existing visitor data
  const fileRef = useRef(null);

  useEffect(() => { fetchMyVisitors(); }, []);

  const fetchMyVisitors = async () => {
    try {
      setLoadingList(true);
      const res = await api.get('/visitors/watchman/mine');
      setVisitors(res.data || []);
    } catch { /* silent */ }
    finally { setLoadingList(false); }
  };

  // Phone blur — check if returning visitor
  const handlePhoneBlur = async () => {
    const phone = formData.phone.trim();
    if (phone.length < 7) return;
    setPhoneChecking(true);
    setReturningBanner(null);
    try {
      const res = await api.get(`/visitors/lookup?phone=${encodeURIComponent(phone)}`);
      if (res.data.found) {
        const v = res.data.visitor;
        setReturningBanner(v);
        // Pre-fill name, email, photo from last visit
        setFormData(prev => ({
          ...prev,
          name:  v.name  || prev.name,
          email: v.email || prev.email,
          photo: v.photo || prev.photo,
        }));
        if (v.photo) setPhotoPreview(v.photo);
      }
    } catch { /* silent */ }
    finally { setPhoneChecking(false); }
  };

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setMessage({ type: 'error', text: 'Only JPEG, PNG or GIF allowed' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Photo must be under 5MB' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photo: reader.result }));
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim())  { setMessage({ type: 'error', text: 'Name is required' }); return; }
    if (!formData.phone.trim()) { setMessage({ type: 'error', text: 'Phone is required' }); return; }
    if (!formData.photo)        { setMessage({ type: 'error', text: 'Photo is required' }); return; }

    setSubmitting(true);
    setMessage(null);
    try {
      await api.post('/visitors/watchman/create', formData);
      setMessage({ type: 'success', text: `Visitor "${formData.name}" registered. Waiting for admin/security approval.` });
      setFormData(EMPTY_FORM);
      setPhotoPreview(null);
      setReturningBanner(null);
      if (fileRef.current) fileRef.current.value = '';
      fetchMyVisitors();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to register visitor' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(EMPTY_FORM);
    setPhotoPreview(null);
    setReturningBanner(null);
    setMessage(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 leading-tight">Watchman Portal</p>
            <p className="text-xs text-gray-500">{user?.name}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      <div className="max-w-6xl mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* ── LEFT: Visitor Entry Form ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Form header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <h2 className="text-white font-bold text-lg">Register Visitor at Gate</h2>
            <p className="text-orange-100 text-sm mt-0.5">Fill visitor details — admin/security will approve</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Message */}
            {message && (
              <div className={`p-3 rounded-xl flex items-start gap-2 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message.type === 'success'
                  ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                }
                {message.text}
              </div>
            )}

            {/* Returning visitor banner */}
            {returningBanner && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                {returningBanner.photo
                  ? <img src={returningBanner.photo} alt="" className="w-12 h-12 rounded-lg object-cover border-2 border-blue-300 flex-shrink-0" />
                  : <div className="w-12 h-12 rounded-lg bg-blue-200 flex items-center justify-center flex-shrink-0"><User className="w-6 h-6 text-blue-500" /></div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Returning Visitor
                  </p>
                  <p className="font-bold text-gray-900 text-sm">{returningBanner.name}</p>
                  <p className="text-xs text-gray-500">
                    Last visit: {new Date(returningBanner.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    <span className={`font-medium ${returningBanner.status === 'approved' ? 'text-green-600' : returningBanner.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {returningBanner.status}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ── SECTION 1: Identity (required) ── */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Identity — Required
                </p>
                <div className="space-y-3">
                  {/* Phone — first */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel" name="phone" value={formData.phone}
                        onChange={handleChange} onBlur={handlePhoneBlur}
                        placeholder="+91 98765 43210" required
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                      />
                      {phoneChecking && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text" name="name" value={formData.name}
                        onChange={handleChange} placeholder="Visitor full name" required
                        className="w-full pl-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                      />
                    </div>
                  </div>

                  {/* Photo — required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Photo <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      {/* Preview */}
                      {photoPreview ? (
                        <img
                          src={photoPreview} alt="Visitor"
                          className="w-20 h-20 rounded-xl object-cover border-2 border-orange-300 flex-shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center flex-shrink-0">
                          <Camera className="w-6 h-6 text-gray-300" />
                          <span className="text-xs text-gray-300 mt-1">Photo</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          ref={fileRef}
                          type="file" accept="image/jpeg,image/png,image/gif"
                          onChange={handlePhoto}
                          className="w-full text-sm text-gray-600 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                        />
                        <p className="text-xs text-gray-400 mt-1">Take or upload visitor photo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200" />

              {/* ── SECTION 2: Visit Details (optional but helpful) ── */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Visit Details — Optional
                </p>
                <div className="space-y-3">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email" name="email" value={formData.email}
                      onChange={handleChange} placeholder="visitor@email.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>

                  {/* Host */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Host / Person to Meet</label>
                    <input
                      type="text" name="host" value={formData.host}
                      onChange={handleChange} placeholder="Who are they visiting?"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit</label>
                    <textarea
                      name="purpose" value={formData.purpose}
                      onChange={handleChange}
                      placeholder="Meeting, Delivery, Interview, etc."
                      rows="2"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition disabled:opacity-50 text-sm"
                >
                  {submitting ? 'Registering...' : 'Register Visitor'}
                </button>
                <button
                  type="button" onClick={handleReset}
                  className="px-5 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── RIGHT: Today's Visitors List ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Visitors Registered by You</h2>
              <p className="text-xs text-gray-500 mt-0.5">{visitors.length} total</p>
            </div>
            <button
              onClick={fetchMyVisitors}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loadingList ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : visitors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <User className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No visitors yet</p>
                <p className="text-gray-400 text-sm mt-1">Visitors you register will appear here</p>
              </div>
            ) : (
              visitors.map(v => (
                <div key={v._id} className="px-5 py-4 hover:bg-gray-50 transition flex items-center gap-4">
                  {/* Photo */}
                  {v.photo ? (
                    <img src={v.photo} alt={v.name} className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-gray-300" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{v.name}</p>
                    <p className="text-xs text-gray-500">{v.phone}</p>
                    {v.purpose && <p className="text-xs text-gray-400 truncate mt-0.5">{v.purpose}</p>}
                  </div>

                  {/* Status + time */}
                  <div className="text-right flex-shrink-0">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[v.status]}`}>
                      {v.status === 'pending' ? 'Pending' :
                       v.status === 'approved' ? 'Approved' :
                       v.status === 'rejected' ? 'Rejected' :
                       v.status === 'checked-in' ? 'Inside' : 'Left'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(v.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Legend */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-yellow-500" /> Pending = waiting for approval</span>
              <span className="flex items-center gap-1"><UserCheck className="w-3 h-3 text-green-500" /> Approved = can enter</span>
              <span className="flex items-center gap-1"><UserX className="w-3 h-3 text-red-500" /> Rejected = denied</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WatchmanDashboard;
