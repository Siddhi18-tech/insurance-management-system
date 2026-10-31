const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Excluded by default in queries for security
    },
    phone: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'agent', 'admin'],
        message: '{VALUE} is not a valid role. Allowed roles: customer, agent, admin'
      },
      default: 'customer'
    },
    dateOfBirth: {
      type: Date
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'USA' }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Virtual for user's full policies (if populated)
userSchema.virtual('policies', {
  ref: 'Policy',
  localField: '_id',
  foreignField: 'user'
});

// Virtual for user's claims
userSchema.virtual('claims', {
  ref: 'Claim',
  localField: '_id',
  foreignField: 'user'
});

const User = mongoose.model('User', userSchema);

module.exports = User;

