"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import DashboardSummary from "@/components/DashboardSummary";
import TaskList from "@/components/TaskList";
import EmployeeList from "@/components/EmployeeList";

export default function Dashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-black">Employee Task Tracker</h1>
            <p className="text-sm text-gray-700">Welcome, {session?.user?.name}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-200 text-blue-900">
                {session?.user?.role === 'Admin' ? '👨‍💼 Admin' : '👤 User'}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="bg-red-600 hover:bg-red-700 font-bold px-4 py-2 rounded text-white"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("summary")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "summary"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-600 hover:text-black hover:border-gray-400"
              }`}
            >
              Dashboard Summary
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "tasks"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-600 hover:text-black hover:border-gray-400"
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab("employees")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "employees"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-600 hover:text-black hover:border-gray-400"
              }`}
            >
              Employees
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === "summary" && <DashboardSummary />}
        {activeTab === "tasks" && <TaskList />}
        {activeTab === "employees" && <EmployeeList />}
      </div>
    </div>
  );
}