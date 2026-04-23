import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';

const CheckLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/checklog');
      setLogs(response.data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.status === filter;
  });

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Check Logs</h1>
          <p className="text-gray-500 text-sm mt-0.5">Visitor check-in/check-out history</p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm w-full sm:w-auto">
          <option value="all">All Status</option>
          <option value="checked-in">Checked In</option>
          <option value="checked-out">Checked Out</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Total</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{logs.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">In</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 mt-0.5">{logs.filter(l=>l.status==='checked-in').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Out</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-600 mt-0.5">{logs.filter(l=>l.status==='checked-out').length}</p>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Visitor','Check In','Check Out','Scanned By','Status'].map(h=>
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400 text-sm">No logs found</td></tr>
              ) : filteredLogs.map(log => (
                <tr key={log._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-sm">{log.visitor?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{log.visitor?.phone || log.visitor?.email || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.checkInTime ? formatDateTime(log.checkInTime) : 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.checkOutTime ? formatDateTime(log.checkOutTime) : 'Not yet'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.scannedBy?.name || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.status==='checked-in'?'bg-green-100 text-green-800':'bg-gray-100 text-gray-700'}`}>{log.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm border border-gray-100">No logs found</div>
        ) : filteredLogs.map(log => (
          <div key={log._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900 text-sm">{log.visitor?.name || 'N/A'}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.status==='checked-in'?'bg-green-100 text-green-800':'bg-gray-100 text-gray-700'}`}>{log.status}</span>
            </div>
            <p className="text-xs text-gray-500">{log.visitor?.phone || log.visitor?.email || ''}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><p className="text-gray-400">Check In</p><p className="text-gray-700 font-medium">{log.checkInTime ? formatDateTime(log.checkInTime) : 'N/A'}</p></div>
              <div><p className="text-gray-400">Check Out</p><p className="text-gray-700 font-medium">{log.checkOutTime ? formatDateTime(log.checkOutTime) : 'Not yet'}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckLogs;
