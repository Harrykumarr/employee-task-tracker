import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Task from '@/models/Task';
import Employee from '@/models/Employee';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import mongoose from 'mongoose';

// GET /api/tasks/[id] - Get a specific task
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
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const task = await Task.findById(id)
      .populate('assignedTo', 'name email department')
      .populate('createdBy', 'name email');

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
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
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const { title, description, status, priority, assignedTo, dueDate } = await request.json();

    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if assigned employee exists if changing assignment
    if (assignedTo && assignedTo !== task.assignedTo.toString()) {
      const employee = await Employee.findById(assignedTo);
      if (!employee) {
        return NextResponse.json(
          { error: 'Assigned employee not found' },
          { status: 404 }
        );
      }
    }

    // Update fields
    if (title) task.title = title.trim();
    if (description) task.description = description.trim();
    if (status) {
      task.status = status;
      // Set completedDate when task is marked complete
      if (status === 'Completed') {
        task.completedDate = new Date();
      } else if (task.completedDate) {
        task.completedDate = null;
      }
    }
    if (priority) task.priority = priority;
    if (assignedTo) task.assignedTo = assignedTo;
    if (dueDate) task.dueDate = dueDate;

    await task.save();
    await task.populate('assignedTo', 'name email department');
    await task.populate('createdBy', 'name email');

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);

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

// DELETE /api/tasks/[id] - Delete a task
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
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    await Task.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
