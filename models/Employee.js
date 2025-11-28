import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  department: {
    type: String,
    required: [true, 'Please provide a department'],
    enum: ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'],
    default: 'Engineering',
  },
  role: {
    type: String,
    required: [true, 'Please provide a role'],
    enum: ['Admin', 'Manager', 'Developer', 'Designer', 'Analyst', 'Other'],
    default: 'Developer',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave'],
    default: 'Active',
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster email lookups
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });

// Create or get existing model
const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

console.log('📝 Employee model initialized:', Employee.modelName);

export default Employee;
