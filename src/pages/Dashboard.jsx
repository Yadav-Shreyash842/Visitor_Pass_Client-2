import { useState, useEffect } from 'react';
import { Users, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatsCard from '../components/ui/StatsCard';
import api from '../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVisitors: 0,
    activePasses: 0,
    todayCheckins: 0,
    pendingApprovals: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample chart data
  const visitorData = [
    { name: 'Mon', visitors: 45 },
    { name: 'Tue', visitors: 52 },
    { name: 'Wed', visitors: 38 },
    { name: 'Thu', visitors: 67 },
    { name: 'Fri', visitors: 75 },
    { name: 'Sat', visitors: 25 },
    { name: 'Sun', visitors: 18 },
  ];

  const checkinData = [
    { name: 'Mon', checkins: 32 },
    { name: 'Tue', checkins: 41 },
    { name: 'Wed', checkins: 28 },
    { name: 'Thu', checkins: 55 },
    { name: 'Fri', checkins: 63 },
    { name: 'Sat', checkins: 18 },
    { name: 'Sun', checkins: 12 },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch visitors
      const visitorsRes = await api.get('/visitors/all');
      const visitors = visitorsRes.data || [];
      
      // Fetch passes
      const passesRes = await api.get('/pass');
      const passes = passesRes.data || [];
      
      // Fetch check logs
      const logsRes = await api.get('/checklog');
      const logs = logsRes.data || [];

      // Calculate stats
      const today = new Date().toDateString();
      const todayLogs = logs.filter(log => 
        new Date(log.createdAt).toDateString() === today
      );

      const activePasses = passes.filter(pass => {
        const now = new Date();
        return new Date(pass.validFrom) <= now && new Date(pass.validTo) >= now;
      });

      const pendingVisitors = visitors.filter(v => v.status === 'pending');

      setStats({
        totalVisitors: visitors.length,
        activePasses: activePasses.length,
        todayCheckins: todayLogs.length,
        pendingApprovals: pendingVisitors.length,
      });

      // Recent activity (last 5 logs)
      setRecentActivity(logs.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Visitors"
          value={stats.totalVisitors}
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend={12}
        />
        <StatsCard
          title="Active Passes"
          value={stats.activePasses}
          icon={CreditCard}
          color="bg-gradient-to-br from-green-500 to-green-600"
          trend={8}
        />
        <StatsCard
          title="Today's Check-ins"
          value={stats.todayCheckins}
          icon={CheckCircle}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          trend={-3}
        />
        <StatsCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={Clock}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitors Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Visitors This Week
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visitorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="visitors" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                dot={{ fill: '#0ea5e9', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Check-ins Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Check-ins Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={checkinData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Bar dataKey="checkins" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No recent activity
            </div>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {activity.visitor?.name || 'Visitor'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.status === 'checked-in' ? 'Checked in' : 'Checked out'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
