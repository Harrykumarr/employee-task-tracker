"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { canCreateTask, canDeleteTask } from "@/lib/auth";

export default function TaskList() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignedTo: "",
  });
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
  });

  const userRole = session?.user?.role || 'User';
  const isAdmin = userRole === 'Admin';

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.assignedTo) params.append("assignedTo", filters.assignedTo);

      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!canCreateTask(userRole)) {
      setError("Only admins can create tasks");
      return;
    }
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error("Failed to create task");
      setNewTask({
        title: "",
        description: "",
        assignedTo: "",
        priority: "Medium",
        status: "Pending",
        dueDate: "",
      });
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/tasks/${editingTask._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTask),
      });
      if (!response.ok) throw new Error("Failed to update task");
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete task");
        fetchTasks();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const statusColors = {
    Pending: "bg-yellow-200 text-yellow-900",
    "In Progress": "bg-blue-200 text-blue-900",
    Completed: "bg-green-200 text-green-900",
    "On Hold": "bg-red-200 text-red-900",
  };

  const priorityColors = {
    Low: "text-gray-900",
    Medium: "text-blue-900",
    High: "text-orange-900",
    Critical: "text-red-900",
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
        <span className={`px-3 py-1 rounded text-sm font-semibold ${isAdmin ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 text-gray-900'}`}>
          {userRole === 'Admin' ? '👨‍💼 Admin' : '👤 User'}
        </span>
      </div>

      {/* Create New Task Form - Only for Admins */}
      {canCreateTask(userRole) && (
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Create New Task</h3>
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
            <select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              className="border rounded px-3 py-2 text-foreground bg-background"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Task Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full border rounded px-3 py-2 text-foreground bg-background"
            rows="3"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="border rounded px-3 py-2 text-foreground bg-background"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Critical">Critical Priority</option>
            </select>
            <select
              value={newTask.status}
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
              className="border rounded px-3 py-2 text-foreground bg-background"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
            <Input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">
            Create Task
          </Button>
        </form>
      </div>
      )}

      {/* Admin Only Message */}
      {!canCreateTask(userRole) && (
      <div className="bg-blue-100 border border-blue-400 p-4 rounded-lg text-blue-900">
        <p>💡 <strong>Admin-Only Feature:</strong> Only administrators can create new tasks. Contact your admin to create a task.</p>
      </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border rounded px-3 py-2 text-foreground bg-background"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="border rounded px-3 py-2 text-foreground bg-background"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <select
            value={filters.assignedTo}
            onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
            className="border rounded px-3 py-2 text-foreground bg-background"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-8 text-foreground">Loading tasks...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">Error: {error}</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-foreground">Title</th>
                  <th className="px-4 py-2 text-left text-foreground">Assigned To</th>
                  <th className="px-4 py-2 text-center text-foreground">Status</th>
                  <th className="px-4 py-2 text-center text-foreground">Priority</th>
                  <th className="px-4 py-2 text-left text-foreground">Due Date</th>
                  <th className="px-4 py-2 text-center text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 text-center text-gray-600">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-semibold text-foreground">{task.title}</td>
                      <td className="px-4 py-2 text-foreground">{task.assignedTo?.name}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[task.status] || ''}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className={`px-4 py-2 text-center font-semibold ${priorityColors[task.priority] || ''}`}>
                        {task.priority}
                      </td>
                      <td className="px-4 py-2 text-foreground">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="text-blue-700 hover:text-blue-900 mr-2 font-semibold"
                        >
                          Edit
                        </button>
                        {canDeleteTask(userRole) && (
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="text-red-700 hover:text-red-900 font-semibold"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-foreground">Edit Task</h3>
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <Input
                placeholder="Title"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              />
              <textarea
                placeholder="Description"
                value={editingTask.description}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                className="w-full border rounded px-3 py-2 text-foreground bg-background"
                rows="3"
              />
              <select
                value={editingTask.status}
                onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                className="w-full border rounded px-3 py-2 text-foreground bg-background"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Update
                </Button>
                <Button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
