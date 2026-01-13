"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DashboardCharts({
  statusData,
  progressData,
}: {
  statusData: { name: string; value: number }[];
  progressData: { name: string; progress: number }[];
}) {
  const statusColors = ["#22c55e", "#f97316", "#ef4444", "#8b5cf6"];
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie dataKey="value" data={statusData} outerRadius={90}>
              {statusData.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={statusColors[idx % statusColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={progressData}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="progress" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
