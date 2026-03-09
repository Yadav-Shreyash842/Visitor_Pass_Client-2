import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Upload, Check, X, Download, Filter, UserCheck, UserX, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

const Visitors = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    purpose: '',
    photo: '',
    idProof: ''
  });

  useEffect(() => {
    fetchVisitors();
  }, []);

  useEffect(() => {
    filterVisitors();
  }, [searchTerm, statusFilter, visitors]);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/visitors/all');
      setVisitors(response.data || []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVisitors = () => {
    let filtered = visitors;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(visitor =>
        visitor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(visitor => visitor.status === statusFilter);
    }

    setFilteredVisitors(filtered);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        alert('Only JPEG, PNG, and GIF files are allowed');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/visitors/createVisitor', formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', purpose: '', photo: '', idProof: '' });
      setPhotoPreview('');
      fetchVisitors();
      alert('Visitor created successfully!');
    } catch (error) {
      console.error('Error creating visitor:', error);
      alert(error.response?.data?.message || 'Failed to create visitor');
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this visitor?')) return;
    
    try {
      await api.patch(`/visitors/${id}/approve`);
      fetchVisitors();
      alert('Visitor approved successfully!');
    } catch (error) {
      console.error('Error approving visitor:', error);
      alert(error.response?.data?.message || 'Failed to approve visitor');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await api.patch(`/visitors/${id}/reject`, { reason });
      fetchVisitors();
      alert('Visitor rejected successfully!');
    } catch (error) {
      console.error('Error rejecting visitor:', error);
      alert(error.response?.data?.message || 'Failed to reject visitor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this visitor?')) return;
    
    try {
      await api.delete(`/visitors/${id}`);
      fetchVisitors();
      alert('Visitor deleted successfully!');
    } catch (error) {
      console.error('Error deleting visitor:', error);
      alert('Failed to delete visitor');
    }
  };

  const handleView = (visitor) => {
    setSelectedVisitor(visitor);
    setIsViewModalOpen(true);
  };

  const exportToCSV = () => {
    if (filteredVisitors.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Purpose', 'Status', 'Created At'];
    const csv = [
      headers.join(','),
      ...filteredVisitors.map(v => [
        v.name,
        v.email,
        v.phone || 'N/A',
        v.purpose,
        v.status,
        new Date(v.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      'checked-in': 'bg-blue-100 text-blue-800',
      'checked-out': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visitors</h1>
          <p className="text-gray-500 mt-1">Manage visitor records and approvals</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md hover:shadow-lg"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Add Visitor
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search visitors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="checked-in">Checked In</option>
            <option value="checked-out">Checked Out</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Photo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No visitors found
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((visitor) => (
                  <tr key={visitor._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      {visitor.photo ? (
                        <img 
                          src={visitor.photo} 
                          alt={visitor.name} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {visitor.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {visitor.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {visitor.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {visitor.purpose}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(visitor.status)}`}>
                        {visitor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleView(visitor)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {visitor.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(visitor._id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Approve"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleReject(visitor._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Reject"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDelete(visitor._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Visitor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPhotoPreview('');
        }}
        title="Add New Visitor"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo Upload
            </label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-24 h-24 rounded-lg object-cover border-2 border-primary-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview('');
                      setFormData({ ...formData, photo: '' });
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <label className="cursor-pointer">
                <div className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Choose Photo</span>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF (Max 5MB)</p>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose *
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
              placeholder="Meeting, Interview, Delivery, etc."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium shadow-md hover:shadow-lg"
          >
            Add Visitor
          </button>
        </form>
      </Modal>

      {/* View Visitor Modal */}
      {selectedVisitor && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedVisitor(null);
          }}
          title="Visitor Details"
        >
          <div className="space-y-4">
            {selectedVisitor.photo && (
              <div className="flex justify-center">
                <img 
                  src={selectedVisitor.photo}
                  alt={selectedVisitor.name}
                  className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900 font-semibold">{selectedVisitor.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{selectedVisitor.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{selectedVisitor.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedVisitor.status)}`}>
                  {selectedVisitor.status}
                </span>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Purpose</label>
                <p className="text-gray-900">{selectedVisitor.purpose}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-gray-900">{new Date(selectedVisitor.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Visitors;
