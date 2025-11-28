import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Task from '@/models/Task';
import Employee from '@/models/Employee';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET /api/dashboard - Get dashboard summary
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get all tasks and calculate statistics
    const allTasks = await Task.find().populate('assignedTo', 'name email department');
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.status === 'Completed').length;
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;

    // Get task status breakdown
    const statusBreakdown = {
      pending: allTasks.filter(task => task.status === 'Pending').length,
      inProgress: allTasks.filter(task => task.status === 'In Progress').length,
      completed: completedTasks,
      onHold: allTasks.filter(task => task.status === 'On Hold').length,
    };

    // Get priority breakdown
    const priorityBreakdown = {
      low: allTasks.filter(task => task.priority === 'Low').length,
      medium: allTasks.filter(task => task.priority === 'Medium').length,
      high: allTasks.filter(task => task.priority === 'High').length,
      critical: allTasks.filter(task => task.priority === 'Critical').length,
    };

    // Get employee statistics
    const employees = await Employee.find();
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'Active').length;

    // Get tasks per employee
    const tasksPerEmployee = await Promise.all(
      employees.map(async (emp) => {
        const empTasks = await Task.countDocuments({ assignedTo: emp._id });
        const completedEmpTasks = await Task.countDocuments({
          assignedTo: emp._id,
          status: 'Completed',
        });
        return {
          employeeId: emp._id,
          employeeName: emp.name,
          totalTasks: empTasks,
          completedTasks: completedEmpTasks,
          completionRate: empTasks > 0 ? ((completedEmpTasks / empTasks) * 100).toFixed(2) : 0,
        };
      })
    );

    // Get overdue tasks
    const overdueeTasks = allTasks.filter(task => {
      if (task.status === 'Completed') return false;
      if (!task.dueDate) return false;
      return new Date() > task.dueDate;
    }).length;

    return NextResponse.json(
      {
        totalTasks,
        completedTasks,
        completionRate: parseFloat(completionRate),
        statusBreakdown,
        priorityBreakdown,
        totalEmployees,
        activeEmployees,
        tasksPerEmployee,
        overdueeTasks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
