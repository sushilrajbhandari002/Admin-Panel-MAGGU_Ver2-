import { Users, GraduationCap, BookOpen, TrendingUp, UserX, Bell } from 'lucide-react';
import { useSchoolSettings } from './SchoolSettingsContext';

export function StatsCards() {
  const { settings, t } = useSchoolSettings();
  const isDark = settings.theme === 'dark';

  const stats = [
    {
      title: t('totalStudents'),
      value: '2,543',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: settings.primaryColor,
    },
    {
      title: settings.language === 'ne' ? 'आज अनुपस्थित' : 'Absent Today',
      value: '87',
      change: '-5%',
      trend: 'down',
      icon: UserX,
      color: '#EF4444',
    },
    {
      title: t('totalTeachers'),
      value: '142',
      change: '+3%',
      trend: 'up',
      icon: GraduationCap,
      color: '#10B981',
    },
    {
      title: t('totalClasses'),
      value: '48',
      change: '+5%',
      trend: 'up',
      icon: BookOpen,
      color: settings.secondaryColor,
    },
    {
      title: t('avgAttendance'),
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: '#F59E0B',
    },
    {
      title: settings.language === 'ne' ? 'बाँकी सूचनाहरू' : 'Pending Notices',
      value: '5',
      change: settings.language === 'ne' ? '२ नयाँ' : '2 new',
      trend: 'up',
      icon: Bell,
      color: '#06B6D4',
    },
  ];

  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const subtextColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-100';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <div key={stat.title} className={`${bgColor} rounded-xl p-4 sm:p-6 shadow-sm border ${borderColor}`}>
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: stat.color }}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span 
                className="text-sm"
                style={{ color: stat.trend === 'down' ? '#10B981' : settings.primaryColor }}
              >
                {stat.change}
              </span>
            </div>
            <h3 className={`${subtextColor} text-sm mb-1`}>{stat.title}</h3>
            <p className={textColor}>{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}