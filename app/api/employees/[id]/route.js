import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Employee from '@/models/Employee';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import mongoose from 'mongoose';

// GET /api/employees/[id] - Get a specific employee with their tasks
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid employee ID' },
        { status: 400 }
      );
    }

    const employee = await Employee.findById(id);

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Get tasks assigned to this employee
    const tasks = await Task.find({ assignedTo: id }).populate('assignedTo', 'name email');

    return NextResponse.json(
      { employee, tasks },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/employees/[id] - Update an employee
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid employee ID' },
        { status: 400 }
      );
    }

    const { name, email, department, role, status } = await request.json();

    const employee = await Employee.findById(id);

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it's unique
    if (email && email.toLowerCase() !== employee.email) {
      const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
      if (existingEmployee) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        );
      }
    }

    // Update fields
    if (name) employee.name = name.trim();
    if (email) employee.email = email.toLowerCase().trim();
    if (department) employee.department = department;
    if (role) employee.role = role;
    if (status) employee.status = status;

    await employee.save();

    return NextResponse.json(employee, { status: 200 });
  } catch (error) {
    console.error('Error updating employee:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id] - Delete an employee
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid employee ID' },
        { status: 400 }
      );
    }

    const employee = await Employee.findById(id);

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if employee has assigned tasks
    const assignedTasks = await Task.countDocuments({ assignedTo: id });
    if (assignedTasks > 0) {
      return NextResponse.json(
        { error: 'Cannot delete employee with assigned tasks' },
        { status: 400 }
      );
    }

    await Employee.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Employee deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
