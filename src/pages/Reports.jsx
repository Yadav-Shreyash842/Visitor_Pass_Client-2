import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, Users, UserCheck, UserX, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

const Reports = () => {
  const [visitors, setVisitors] = useState([]);
  const [checkLogs, setCheckLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [visitorsRes, logsRes] = await Promise.all([
        api.get('/visitors/all'),
        api.get('/checklog')
      ]);
      setVisitors(visitorsRes.data || []);
      setCheckLogs(logsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredVisitors = () => {
    let filtered = visitors;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status === statusFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter(v => new Date(v.createdAt) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(v => new Date(v.createdAt) <= new Date(dateTo));
    }

    return filtered;
  };

  const getStats = () => {
    const filtered = getFilteredVisitors();
    return {
      total: filtered.length,
      pending: filtered.filter(v => v.status === 'pending').length,
      approved: filtered.filter(v => v.status === 'approved').length,
      rejected: filtered.filter(v => v.status === 'rejected').length,
      checkedIn: filtered.filter(v => v.status === 'checked-in').length,
      checkedOut: filtered.filter(v => v.status === 'checked-out').length,
    };
  };

  const getStatusData = () => {
    const stats = getStats();
    return [
      { name: 'Pending', value: stats.pending, color: '#f59e0b' },
      { name: 'Approved', value: stats.approved, color: '#10b981' },
      { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
      { name: 'Checked In', value: stats.checkedIn, color: '#3b82f6' },
      { name: 'Checked Out', value: stats.checkedOut, color: '#6b7280' },
    ];
  };

  const getDailyData = () => {
    const filtered = getFilteredVisitors();
    const dailyMap = {};

    filtered.forEach(visitor => {
      const date = new Date(visitor.createdAt).toLocaleDateString();
      dailyMap[date] = (dailyMap[date] || 0) + 1;
    });

    return Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .slice(-7); // Last 7 days
  };

  const exportReport = () => {
    const filtered = getFilteredVisitors();
    if (filtered.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Purpose', 'Status', 'Created At', 'Updated At'];
    const csv = [
      headers.join(','),
      ...filtered.map(v => [
        v.name,
        v.email,
        v.phone || 'N/A',
        v.purpose,
        v.status,
        new Date(v.createdAt).toLocaleString(),
        new Date(v.updatedAt).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitor_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = getStats();
  const statusData = getStatusData();
  const dailyData = getDailyData();

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
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Generate detailed visitor reports and insights</p>
        </div>
        <button
          onClick={exportReport}
          className="inline-flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md hover:shadow-lg"
        >
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="overview">Overview</option>
              <option value="detailed">Detailed</option>
              <option value="trends">Trends</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <UserCheck className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <UserX className="w-10 h-10 text-red-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Checked In</p>
              <p className="text-2xl font-bold text-blue-600">{stats.checkedIn}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Checked Out</p>
              <p className="text-2xl font-bold text-gray-600">{stats.checkedOut}</p>
            </div>
            <FileText className="w-10 h-10 text-gray-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Visitor Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                dot={{ fill: '#0ea5e9', r: 5 }}
                name="Visitors"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Visitor Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getFilteredVisitors().slice(0, 10).map((visitor) => (
                <tr key={visitor._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{visitor.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{visitor.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{visitor.purpose}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      visitor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      visitor.status === 'approved' ? 'bg-green-100 text-green-800' :
                      visitor.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      visitor.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {visitor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(visitor.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
