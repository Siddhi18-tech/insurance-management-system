const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    policyNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    title: {
      type: String,
      required: [true, 'Policy title is required'],
      trim: true
    },
    policyType: {
      type: String,
      required: [true, 'Policy type is required'],
      enum: {
        values: ['Health', 'Auto', 'Life', 'Home', 'Travel', 'Property'],
        message: '{VALUE} is not a valid policy type'
      }
    },
    description: {
      type: String,
      trim: true
    },
    premiumAmount: {
      type: Number,
      required: [true, 'Premium amount is required'],
      min: [0, 'Premium amount cannot be negative']
    },
    coverageAmount: {
      type: Number,
      required: [true, 'Coverage amount is required'],
      min: [0, 'Coverage amount cannot be negative']
    },
    deductibleAmount: {
      type: Number,
      default: 0,
      min: [0, 'Deductible amount cannot be negative']
    },
    paymentFrequency: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'],
      default: 'Annual'
    },
    termMonths: {
      type: Number,
      default: 12,
      min: [1, 'Term must be at least 1 month']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Pending', 'Expired', 'Cancelled'],
        message: '{VALUE} is not a valid policy status'
      },
      default: 'Active'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Policyholder user reference is required']
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    nomineeName: {
      type: String,
      trim: true,
      default: ''
    },
    nomineeRelation: {
      type: String,
      trim: true,
      default: ''
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

// Pre-validate hook to calculate endDate if omitted and termMonths is provided
policySchema.pre('validate', function () {
  if (!this.policyNumber) {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.policyNumber = `POL-${Date.now().toString().slice(-4)}${randomHex}`;
  }

  if (this.startDate && !this.endDate && this.termMonths) {
    const end = new Date(this.startDate);
    end.setMonth(end.getMonth() + this.termMonths);
    this.endDate = end;
  }
});

// Virtual for claims filed under this policy
policySchema.virtual('claims', {
  ref: 'Claim',
  localField: '_id',
  foreignField: 'policy'
});

const Policy = mongoose.model('Policy', policySchema);

module.exports = Policy;

