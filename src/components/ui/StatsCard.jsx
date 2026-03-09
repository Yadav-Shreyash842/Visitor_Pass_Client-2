const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 card-hover border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
