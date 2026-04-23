import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Eye, Upload, X, Download, UserCheck, UserX, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/ui/Modal';

const STATUS_BADGE = {
  pending:      'bg-yellow-100 text-yellow-800',
  approved:     'bg-green-100 text-green-800',
  rejected:     'bg-red-100 text-red-800',
  'checked-in': 'bg-blue-100 text-blue-800',
  'checked-out':'bg-gray-100 text-gray-800',
};

const EMPTY = { name:'', email:'', phone:'', purpose:'', host:'', photo:'', idProof:'' };

const Visitors = () => {
  const [visitors, setVisitors]           = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [isAddOpen, setIsAddOpen]         = useState(false);
  const [isViewOpen, setIsViewOpen]       = useState(false);
  const [selected, setSelected]           = useState(null);
  const [photoPreview, setPhotoPreview]   = useState('');
  const [formData, setFormData]           = useState(EMPTY);

  useEffect(() => { fetchVisitors(); }, []);
  useEffect(() => { applyFilter(); }, [search, statusFilter, visitors]);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/visitors/all');
      setVisitors(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const applyFilter = () => {
    let f = visitors;
    if (search) f = f.filter(v =>
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase()) ||
      v.phone?.toLowerCase().includes(search.toLowerCase()) ||
      v.purpose?.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'all') f = f.filter(v => v.status === statusFilter);
    setFiltered(f);
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { alert('Max 5MB'); return; }
    if (!['image/jpeg','image/png','image/gif'].includes(file.type)) { alert('JPEG/PNG/GIF only'); return; }
    const r = new FileReader();
    r.onloadend = () => { setPhotoPreview(r.result); setFormData(p => ({...p, photo: r.result})); };
    r.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/visitors/createVisitor', formData);
      setIsAddOpen(false); setFormData(EMPTY); setPhotoPreview('');
      fetchVisitors();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this visitor?')) return;
    try { await api.patch(`/visitors/${id}/approve`); fetchVisitors(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason:');
    if (!reason) return;
    try { await api.patch(`/visitors/${id}/reject`, { reason }); fetchVisitors(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this visitor?')) return;
    try { await api.delete(`/visitors/${id}`); fetchVisitors(); }
    catch { alert('Failed to delete'); }
  };

  const exportCSV = () => {
    if (!filtered.length) { alert('No data'); return; }
    const rows = [
      ['Name','Email','Phone','Purpose','Status','Date'],
      ...filtered.map(v => [v.name, v.email, v.phone||'', v.purpose, v.status, new Date(v.createdAt).toLocaleDateString()])
    ].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rows], {type:'text/csv'}));
    a.download = `visitors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Visitors</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage visitor records and approvals</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Visitor
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search visitors..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="checked-in">Checked In</option>
            <option value="checked-out">Checked Out</option>
          </select>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Photo','Name','Email','Phone','Purpose','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400 text-sm">No visitors found</td></tr>
              ) : filtered.map(v => (
                <tr key={v._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    {v.photo
                      ? <img src={v.photo} alt={v.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                      : <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400" /></div>
                    }
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {v.name}
                    {v.createdByRole === 'watchman' && (
                      <span className="ml-1.5 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">via Watchman</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[140px] truncate">{v.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{v.phone || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px] truncate">{v.purpose}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[v.status]}`}>{v.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelected(v); setIsViewOpen(true); }} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition"><Eye className="w-4 h-4" /></button>
                      {v.status === 'pending' && <>
                        <button onClick={() => handleApprove(v._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"><UserCheck className="w-4 h-4" /></button>
                        <button onClick={() => handleReject(v._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"><UserX className="w-4 h-4" /></button>
                      </>}
                      <button onClick={() => handleDelete(v._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm border border-gray-100">No visitors found</div>
        ) : filtered.map(v => (
          <div key={v._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start gap-3">
              {v.photo
                ? <img src={v.photo} alt={v.name} className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><ImageIcon className="w-5 h-5 text-gray-400" /></div>
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{v.name}</p>
                    {v.createdByRole === 'watchman' && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">via Watchman</span>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[v.status]}`}>{v.status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{v.phone || v.email || 'N/A'}</p>
                <p className="text-xs text-gray-400 truncate">{v.purpose}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
              <button onClick={() => { setSelected(v); setIsViewOpen(true); }} className="flex-1 py-1.5 text-xs text-primary-600 bg-primary-50 rounded-lg font-medium">View</button>
              {v.status === 'pending' && <>
                <button onClick={() => handleApprove(v._id)} className="flex-1 py-1.5 text-xs text-green-700 bg-green-50 rounded-lg font-medium">Approve</button>
                <button onClick={() => handleReject(v._id)} className="flex-1 py-1.5 text-xs text-red-700 bg-red-50 rounded-lg font-medium">Reject</button>
              </>}
              <button onClick={() => handleDelete(v._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); setPhotoPreview(''); }} title="Add New Visitor">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-3">
            {photoPreview
              ? <div className="relative flex-shrink-0">
                  <img src={photoPreview} alt="" className="w-20 h-20 rounded-lg object-cover border-2 border-primary-300" />
                  <button type="button" onClick={() => { setPhotoPreview(''); setFormData(p=>({...p,photo:''})); }}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                </div>
              : <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0"><ImageIcon className="w-7 h-7 text-gray-300" /></div>
            }
            <label className="cursor-pointer flex-1">
              <div className="px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition inline-flex items-center gap-2 text-sm">
                <Upload className="w-4 h-4" /> Choose Photo
              </div>
              <input type="file" accept="image/jpeg,image/png,image/gif" onChange={handlePhoto} className="hidden" />
            </label>
          </div>
          {[
            { label:'Name *', name:'name', type:'text', required:true },
            { label:'Email *', name:'email', type:'email', required:true },
            { label:'Phone', name:'phone', type:'tel', required:false },
            { label:'Host *', name:'host', type:'text', required:true },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} value={formData[f.name]} required={f.required}
                onChange={e => setFormData(p=>({...p,[f.name]:e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
            <textarea value={formData.purpose} required rows="2"
              onChange={e => setFormData(p=>({...p,purpose:e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-sm">
            Add Visitor
          </button>
        </form>
      </Modal>

      {/* View Modal */}
      {selected && (
        <Modal isOpen={isViewOpen} onClose={() => { setIsViewOpen(false); setSelected(null); }} title="Visitor Details">
          <div className="space-y-4">
            {selected.photo && (
              <div className="flex justify-center">
                <img src={selected.photo} alt={selected.name} className="w-28 h-28 rounded-xl object-cover border-2 border-gray-200" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Name', selected.name],
                ['Email', selected.email],
                ['Phone', selected.phone || 'N/A'],
                ['Host', selected.host || 'N/A'],
                ['Status', selected.status],
                ['Date', new Date(selected.createdAt).toLocaleDateString()],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs font-medium text-gray-500">{label}</p>
                  <p className="text-gray-900 font-medium truncate">{val}</p>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-xs font-medium text-gray-500">Purpose</p>
                <p className="text-gray-900">{selected.purpose}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Visitors;
