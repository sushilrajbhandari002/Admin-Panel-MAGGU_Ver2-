import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function AttendanceChart() {
  const data = [
    { day: "Mon", present: 2380, absent: 163 },
    { day: "Tue", present: 2420, absent: 123 },
    { day: "Wed", present: 2350, absent: 193 },
    { day: "Thu", present: 2450, absent: 93 },
    { day: "Fri", present: 2400, absent: 143 },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-gray-900 mb-4">Weekly Attendance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
          />
          <XAxis dataKey="day" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar
            dataKey="present"
            fill="#3b82f6"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="absent"
            fill="#ef4444"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}