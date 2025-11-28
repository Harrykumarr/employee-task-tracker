import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Task from '@/models/Task';
import Employee from '@/models/Employee';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET /api/tasks - Get all tasks with filters
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
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    let query = {};

    if (status) {
      query.status = status;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email department')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
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

    const { title, description, status, priority, assignedTo, dueDate } = await request.json();

    // Validation
    if (!title || !assignedTo) {
      return NextResponse.json(
        { error: 'Title and assignedTo are required' },
        { status: 400 }
      );
    }

    // Check if assigned employee exists
    const employee = await Employee.findById(assignedTo);
    if (!employee) {
      return NextResponse.json(
        { error: 'Assigned employee not found' },
        { status: 404 }
      );
    }

    const task = new Task({
      title: title.trim(),
      description: description?.trim() || '',
      status,
      priority,
      assignedTo,
      dueDate,
      createdBy: session.user.id,
    });

    await task.save();
    await task.populate('assignedTo', 'name email department');
    await task.populate('createdBy', 'name email');

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);

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
