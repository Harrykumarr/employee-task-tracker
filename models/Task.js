import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
    trim: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'On Hold'],
    default: 'Pending',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Please assign the task to an employee'],
  },
  dueDate: {
    type: Date,
  },
  completedDate: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdAt: -1 });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function () {
  if (this.status === 'Completed') return false;
  if (!this.dueDate) return false;
  return new Date() > this.dueDate;
});

// Create or get existing model
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

console.log('📝 Task model initialized:', Task.modelName);

export default Task;
