import { FileText } from 'lucide-react';

export function UpcomingExams() {
  const exams = [
    { id: 1, subject: 'Mathematics', date: 'Dec 1', class: 'Grade 10' },
    { id: 2, subject: 'Science', date: 'Dec 3', class: 'Grade 9' },
    { id: 3, subject: 'English', date: 'Dec 5', class: 'Grade 11' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900">Upcoming Exams</h3>
        <FileText className="w-5 h-5 text-orange-600" />
      </div>
      
      <div className="space-y-3">
        {exams.map((exam) => (
          <div key={exam.id} className="p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
            <p className="text-gray-900 text-sm mb-1">{exam.subject}</p>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{exam.class}</span>
              <span>{exam.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
