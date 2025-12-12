import { MoreVertical } from 'lucide-react';

export function RecentStudents() {
  const students = [
    { id: 1, name: 'Emma Thompson', grade: 'Grade 10', status: 'Active', image: 'ET' },
    { id: 2, name: 'Michael Chen', grade: 'Grade 9', status: 'Active', image: 'MC' },
    { id: 3, name: 'Sophia Rodriguez', grade: 'Grade 11', status: 'Active', image: 'SR' },
    { id: 4, name: 'James Wilson', grade: 'Grade 10', status: 'Active', image: 'JW' },
    { id: 5, name: 'Olivia Brown', grade: 'Grade 12', status: 'Active', image: 'OB' },
  ];

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900">Recent Students</h3>
        <button className="text-blue-600 text-sm hover:underline">View All</button>
      </div>
      
      <div className="space-y-3">
        {students.map((student, index) => (
          <div key={student.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${colors[index % colors.length]} rounded-full flex items-center justify-center text-white`}>
                {student.image}
              </div>
              <div>
                <p className="text-gray-900">{student.name}</p>
                <p className="text-gray-500 text-sm">{student.grade}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {student.status}
              </span>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
