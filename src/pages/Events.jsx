import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, ToggleLeft, ToggleRight, Calendar, Clock } from 'lucide-react';
import api from '../api/axios';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', startTime: '', endTime: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      setEvents(res.data || []);
    } catch { setError('Failed to load events'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.post('/events', formData);
      setFormData({ name: '', description: '', startTime: '', endTime: '' });
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/events/${id}/toggle`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch { alert('Failed to delete event'); }
  };

  const isCurrentlyActive = (event) => {
    if (!event.isActive) return false;
    const now = new Date();
    return new Date(event.startTime) <= now && new Date(event.endTime) >= now;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Special Events</h1>
          <p className="text-gray-500 mt-1">When an event is active, QR + OTP is required at entry</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium shadow-md"
        >
          <Plus className="w-5 h-5" />
          New Event
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Event</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Annual Conference, Product Launch, etc."
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time *</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time *</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events list */}
      {events.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Shield className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No events created yet</p>
          <p className="text-sm text-gray-400 mt-1">Create an event to enable QR+OTP mode at entry</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => {
            const active = isCurrentlyActive(event);
            return (
              <div
                key={event._id}
                className={`bg-white rounded-2xl shadow-sm border-2 p-5 transition ${active ? 'border-purple-400 shadow-purple-100' : 'border-gray-100'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {active && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                          LIVE
                        </span>
                      )}
                      {event.isActive && !active && (
                        <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                          Scheduled
                        </span>
                      )}
                      {!event.isActive && (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-gray-900 text-lg">{event.name}</p>
                    {event.description && <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>}
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Until {new Date(event.endTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggle(event._id)}
                      title={event.isActive ? 'Deactivate' : 'Activate'}
                      className={`p-2 rounded-xl transition ${event.isActive ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                      {event.isActive
                        ? <ToggleRight className="w-7 h-7" />
                        : <ToggleLeft className="w-7 h-7" />
                      }
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-800 mb-1">How it works</p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Only <strong>one event can be active</strong> at a time — activating one deactivates others</li>
          <li>• When an event is active and within its time window, the entry scanner switches to <strong>QR + OTP mode</strong></li>
          <li>• Normal entry (pass code only) resumes automatically when the event ends or is deactivated</li>
        </ul>
      </div>
    </div>
  );
};

export default Events;
