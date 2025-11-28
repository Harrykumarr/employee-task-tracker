import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const { name, email, password, confirmPassword, role } = await request.json();

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'User', // Use selected role or default to 'User'
    });

    // Save user to database
    await user.save();

    // Return success response (without password, including role)
    const userResponse = user.toObject();
    delete userResponse.password; // Remove password from response

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: userResponse, // Includes role field
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }

    // Handle duplicate key error (shouldn't happen due to our check, but just in case)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}