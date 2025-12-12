import { AlertCircle } from 'lucide-react';

export function UpcomingNotices() {
  const notices = [
    { id: 1, title: 'Holiday Notice', date: 'Nov 24', priority: 'high' },
    { id: 2, title: 'Fee Payment Reminder', date: 'Nov 25', priority: 'medium' },
    { id: 3, title: 'New Admission Open', date: 'Nov 26', priority: 'low' },
  ];

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900">Upcoming Notices</h3>
        <AlertCircle className="w-5 h-5 text-blue-600" />
      </div>
      
      <div className="space-y-3">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className={`p-3 border rounded-lg ${priorityColors[notice.priority as keyof typeof priorityColors]}`}
          >
            <p className="text-sm mb-1">{notice.title}</p>
            <p className="text-xs opacity-75">{notice.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
