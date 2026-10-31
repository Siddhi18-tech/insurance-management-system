const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy',
      required: [true, 'Policy reference is required']
    },
    title: {
      type: String,
      required: [true, 'Reminder title is required'],
      trim: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    amount: {
      type: Number,
      required: [true, 'Premium amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Dismissed', 'Paid'],
        message: '{VALUE} is not a valid reminder status'
      },
      default: 'Active'
    },
    note: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;

