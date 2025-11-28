"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function DashboardSummary() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-6 text-center text-foreground">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  if (!dashboardData) return <div className="p-6 text-center text-foreground">No data available</div>;

  const statusData = [
    { name: "Pending", value: dashboardData.statusBreakdown.pending },
    { name: "In Progress", value: dashboardData.statusBreakdown.inProgress },
    { name: "Completed", value: dashboardData.statusBreakdown.completed },
    { name: "On Hold", value: dashboardData.statusBreakdown.onHold },
  ];

  const priorityData = [
    { name: "Low", value: dashboardData.priorityBreakdown.low },
    { name: "Medium", value: dashboardData.priorityBreakdown.medium },
    { name: "High", value: dashboardData.priorityBreakdown.high },
    { name: "Critical", value: dashboardData.priorityBreakdown.critical },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
          <div className="text-sm text-blue-900 font-semibold">Total Tasks</div>
          <div className="text-3xl font-bold text-blue-950">{dashboardData.totalTasks}</div>
        </div>
        <div className="bg-green-100 p-4 rounded-lg border border-green-300">
          <div className="text-sm text-green-900 font-semibold">Completed</div>
          <div className="text-3xl font-bold text-green-950">{dashboardData.completedTasks}</div>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg border border-purple-300">
          <div className="text-sm text-purple-900 font-semibold">Completion Rate</div>
          <div className="text-3xl font-bold text-purple-950">{dashboardData.completionRate}%</div>
        </div>
        <div className="bg-red-100 p-4 rounded-lg border border-red-300">
          <div className="text-sm text-red-900 font-semibold">Overdue Tasks</div>
          <div className="text-3xl font-bold text-red-950">{dashboardData.overdueeTasks}</div>
        </div>
      </div>

      {/* Employee Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-indigo-100 p-4 rounded-lg border border-indigo-300">
          <div className="text-sm text-indigo-900 font-semibold">Total Employees</div>
          <div className="text-3xl font-bold text-indigo-950">{dashboardData.totalEmployees}</div>
        </div>
        <div className="bg-emerald-100 p-4 rounded-lg border border-emerald-300">
          <div className="text-sm text-emerald-900 font-semibold">Active Employees</div>
          <div className="text-3xl font-bold text-emerald-950">{dashboardData.activeEmployees}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Chart */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Chart */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Task Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tasks per Employee */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Tasks per Employee</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-foreground">Employee Name</th>
                <th className="px-4 py-2 text-center text-foreground">Total Tasks</th>
                <th className="px-4 py-2 text-center text-foreground">Completed</th>
                <th className="px-4 py-2 text-center text-foreground">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.tasksPerEmployee.map((emp) => (
                <tr key={emp.employeeId} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-foreground">{emp.employeeName}</td>
                  <td className="px-4 py-2 text-center text-foreground">{emp.totalTasks}</td>
                  <td className="px-4 py-2 text-center text-foreground">{emp.completedTasks}</td>
                  <td className="px-4 py-2 text-center font-semibold text-green-700">{emp.completionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
