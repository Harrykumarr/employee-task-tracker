"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { canEditEmployee, canDeleteEmployee } from "@/lib/auth";

export default function EmployeeList() {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    department: "Engineering",
    role: "Developer",
    status: "Active",
  });
  const [filters, setFilters] = useState({
    department: "",
    search: "",
  });

  const userRole = session?.user?.role || 'User';
  const isAdmin = userRole === 'Admin';

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.department) params.append("department", filters.department);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/employees?${params}`);
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee),
      });
      if (!response.ok) throw new Error("Failed to create employee");
      setNewEmployee({
        name: "",
        email: "",
        department: "Engineering",
        role: "Developer",
        status: "Active",
      });
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/employees/${editingEmployee._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEmployee),
      });
      if (!response.ok) throw new Error("Failed to update employee");
      setEditingEmployee(null);
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(`/api/employees/${employeeId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to delete employee");
        }
        fetchEmployees();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const statusColors = {
    Active: "bg-green-200 text-green-900",
    Inactive: "bg-gray-200 text-gray-900",
    "On Leave": "bg-yellow-200 text-yellow-900",
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Employees</h2>
        <span className={`px-3 py-1 rounded text-sm font-semibold ${isAdmin ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 text-gray-900'}`}>
          {userRole === 'Admin' ? '👨‍💼 Admin' : '👤 User'}
        </span>
      </div>

      {/* Create New Employee Form - Only for Admins */}
      {isAdmin && (
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Add New Employee</h3>
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Full Name"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={newEmployee.department}
              onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
              className="border rounded px-3 py-2 text-foreground bg-background"
            >
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
            </select>
            <select
              value={newEmployee.role}
              onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
              className="border rounded px-3 py-2 text-foreground bg-background"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Analyst">Analyst</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={newEmployee.status}
              onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value })}
              className="border rounded px-3 py-2 text-foreground bg-background"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
          <Button type="submit" className="w-full">
            Add Employee
          </Button>
        </form>
      </div>
      )}

      {/* Admin Only Message */}
      {!isAdmin && (
      <div className="bg-blue-100 border border-blue-400 p-4 rounded-lg text-blue-900">
        <p>💡 <strong>Admin-Only Feature:</strong> Only administrators can add new employees. Contact your admin to add an employee.</p>
      </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Search by name or email"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="border rounded px-3 py-2 text-foreground bg-background"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Operations">Operations</option>
            <option value="Finance">Finance</option>
          </select>
        </div>
      </div>

      {/* Employees List */}
      {loading ? (
        <div className="text-center py-8 text-foreground">Loading employees...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">Error: {error}</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-foreground">Name</th>
                  <th className="px-4 py-2 text-left text-foreground">Email</th>
                  <th className="px-4 py-2 text-left text-foreground">Department</th>
                  <th className="px-4 py-2 text-left text-foreground">Role</th>
                  <th className="px-4 py-2 text-center text-foreground">Status</th>
                  <th className="px-4 py-2 text-center text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 text-center text-gray-600">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-semibold text-foreground">{emp.name}</td>
                      <td className="px-4 py-2 text-foreground">{emp.email}</td>
                      <td className="px-4 py-2 text-foreground">{emp.department}</td>
                      <td className="px-4 py-2 text-foreground">{emp.role}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[emp.status] || ''}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => setEditingEmployee(emp)}
                          className="text-blue-700 hover:text-blue-900 mr-2 font-semibold"
                        >
                          Edit
                        </button>
                        {canDeleteEmployee(userRole) && (
                          <button
                            onClick={() => handleDeleteEmployee(emp._id)}
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

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-foreground">Edit Employee</h3>
            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <Input
                placeholder="Name"
                value={editingEmployee.name}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
              />
              <Input
                type="email"
                placeholder="Email"
                value={editingEmployee.email}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
              />
              <select
                value={editingEmployee.department}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                className="w-full border rounded px-3 py-2 text-foreground bg-background"
              >
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
              </select>
              <select
                value={editingEmployee.status}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value })}
                className="w-full border rounded px-3 py-2 text-foreground bg-background"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Update
                </Button>
                <Button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
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
