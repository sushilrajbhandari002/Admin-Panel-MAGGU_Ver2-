import { useState } from 'react';
import { Download, Calendar, TrendingUp, Users, Award, MessageSquare } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

export function Reports() {
  const [selectedReport, setSelectedReport] = useState<'attendance' | 'performance' | 'feedback'>('attendance');
  const [dateRange, setDateRange] = useState('thisMonth');

  // Attendance Data
  const attendanceData = [
    { class: 'Grade 6', present: 245, absent: 12, percentage: 95.3 },
    { class: 'Grade 7', present: 268, absent: 15, percentage: 94.7 },
    { class: 'Grade 8', present: 289, absent: 18, percentage: 94.1 },
    { class: 'Grade 9', present: 312, absent: 22, percentage: 93.4 },
    { class: 'Grade 10', present: 334, absent: 19, percentage: 94.6 },
    { class: 'Grade 11', presence: 298, absent: 16, percentage: 94.9 },
    { class: 'Grade 12', present: 287, absent: 14, percentage: 95.3 },
  ];

  // Performance Data
  const performanceData = [
    { subject: 'Math', average: 78, pass: 92, fail: 8 },
    { subject: 'Science', average: 82, pass: 95, fail: 5 },
    { subject: 'English', average: 85, pass: 97, fail: 3 },
    { subject: 'History', average: 80, pass: 93, fail: 7 },
    { subject: 'Geography', average: 77, pass: 90, fail: 10 },
  ];

  // Feedback Distribution
  const feedbackData = [
    { name: 'Excellent', value: 45, color: '#10b981' },
    { name: 'Good', value: 35, color: '#3b82f6' },
    { name: 'Average', value: 15, color: '#f59e0b' },
    { name: 'Poor', value: 5, color: '#ef4444' },
  ];

  // Monthly Trend
  const trendData = [
    { month: 'Jul', attendance: 93.2, performance: 76 },
    { month: 'Aug', attendance: 94.1, performance: 78 },
    { month: 'Sep', attendance: 93.8, performance: 80 },
    { month: 'Oct', attendance: 94.5, performance: 81 },
    { month: 'Nov', attendance: 94.7, performance: 82 },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">School Reports</h1>
        <p className="text-gray-600">Comprehensive reports on attendance, performance, and feedback</p>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedReport('attendance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedReport === 'attendance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-5 h-5" />
              Attendance
            </button>
            <button
              onClick={() => setSelectedReport('performance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedReport === 'performance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Award className="w-5 h-5" />
              Performance
            </button>
            <button
              onClick={() => setSelectedReport('feedback')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedReport === 'feedback'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Feedback
            </button>
          </div>

          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Report */}
      {selectedReport === 'attendance' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total Students</p>
                  <p className="text-gray-900">2,543</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Present Today</p>
                  <p className="text-gray-900">2,456</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Absent Today</p>
                  <p className="text-gray-900">87</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Attendance Rate</p>
                  <p className="text-gray-900">94.7%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-gray-900 mb-4">Class-wise Attendance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="class" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="absent" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-gray-900 mb-4">Monthly Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-gray-900">Detailed Attendance Report</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-700">Class</th>
                    <th className="px-6 py-3 text-left text-gray-700">Total Students</th>
                    <th className="px-6 py-3 text-left text-gray-700">Present</th>
                    <th className="px-6 py-3 text-left text-gray-700">Absent</th>
                    <th className="px-6 py-3 text-left text-gray-700">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendanceData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{row.class}</td>
                      <td className="px-6 py-4 text-gray-700">{row.present + row.absent}</td>
                      <td className="px-6 py-4 text-green-600">{row.present}</td>
                      <td className="px-6 py-4 text-red-600">{row.absent}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {row.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Performance Report */}
      {selectedReport === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-gray-900 mb-4">Subject-wise Average Scores</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="subject" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="average" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-gray-900 mb-4">Overall Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="performance" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-gray-900">Subject Performance Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-700">Subject</th>
                    <th className="px-6 py-3 text-left text-gray-700">Average Score</th>
                    <th className="px-6 py-3 text-left text-gray-700">Pass %</th>
                    <th className="px-6 py-3 text-left text-gray-700">Fail %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {performanceData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{row.subject}</td>
                      <td className="px-6 py-4 text-gray-700">{row.average}%</td>
                      <td className="px-6 py-4 text-green-600">{row.pass}%</td>
                      <td className="px-6 py-4 text-red-600">{row.fail}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Report */}
      {selectedReport === 'feedback' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-gray-900 mb-4">Feedback Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={feedbackData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {feedbackData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-gray-900 mb-6">Feedback Summary</h3>
              <div className="space-y-4">
                {feedbackData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-900">{item.value}%</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.value}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-gray-900 mb-4">Recent Feedback Comments</h3>
            <div className="space-y-4">
              {[
                { id: 1, from: 'Parent - John Doe', comment: 'Excellent teaching methods and care for students.', rating: 'Excellent', date: '2025-11-20' },
                { id: 2, from: 'Parent - Sarah Smith', comment: 'Good infrastructure but need more extracurricular activities.', rating: 'Good', date: '2025-11-19' },
                { id: 3, from: 'Parent - Michael Chen', comment: 'The school has improved significantly this year.', rating: 'Excellent', date: '2025-11-18' },
              ].map((feedback) => (
                <div key={feedback.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-gray-900">{feedback.from}</p>
                      <p className="text-gray-500 text-sm">{feedback.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      feedback.rating === 'Excellent'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {feedback.rating}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{feedback.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
