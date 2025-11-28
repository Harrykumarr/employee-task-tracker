import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET /api/employees - Get all employees
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

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const search = searchParams.get('search');

    let query = {};

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });

    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create a new employee
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { name, email, department, role, status } = await request.json();

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 409 }
      );
    }

    const employee = new Employee({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      department,
      role,
      status,
    });

    await employee.save();

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);

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
