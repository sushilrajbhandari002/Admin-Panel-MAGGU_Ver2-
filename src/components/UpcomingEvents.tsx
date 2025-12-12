import { Calendar, Clock } from 'lucide-react';

export function UpcomingEvents() {
  const events = [
    {
      id: 1,
      title: 'Parent-Teacher Meeting',
      date: 'Nov 25, 2025',
      time: '10:00 AM',
      type: 'meeting',
    },
    {
      id: 2,
      title: 'Science Fair',
      date: 'Nov 28, 2025',
      time: '9:00 AM',
      type: 'event',
    },
    {
      id: 3,
      title: 'Math Examination',
      date: 'Dec 1, 2025',
      time: '8:30 AM',
      type: 'exam',
    },
    {
      id: 4,
      title: 'Sports Day',
      date: 'Dec 5, 2025',
      time: '7:00 AM',
      type: 'event',
    },
  ];

  const typeColors = {
    meeting: 'bg-blue-100 text-blue-700',
    event: 'bg-purple-100 text-purple-700',
    exam: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900">Upcoming Events</h3>
        <button className="text-blue-600 text-sm hover:underline">View Calendar</button>
      </div>
      
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-gray-900">{event.title}</h4>
              <span className={`px-2 py-1 rounded text-xs ${typeColors[event.type as keyof typeof typeColors]}`}>
                {event.type}
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-600 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{event.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
