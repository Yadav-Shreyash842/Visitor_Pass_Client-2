const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 sm:mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ml-2 ${color}`}>
          <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
