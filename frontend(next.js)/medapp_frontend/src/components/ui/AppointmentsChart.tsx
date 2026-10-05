"use client";

import { FiClipboard } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AppointmentTrend {
  date: string;
  count: number;
}

interface AppointmentsChartProps {
  data: AppointmentTrend[];
}

export default function AppointmentsChart({ data }: AppointmentsChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", {
      weekday: "short",
    }),
  }));
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-amber-900 to-orange-500 flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-1">
            <div className="w-10 h-10 rounded-xl font-bold text-white flex items-center justify-center">
              <FiClipboard size={20} />
            </div>
          <div>
            <h2 className="font-semibold text-white text-gray-800">Appointments Chart</h2>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <p className="mt-1 text-sm text-gray-500">
          Appointments over the last 7 days
        </p>

        <div className="mt-6 h-68">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
