const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    claimNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy',
      required: [true, 'Policy reference is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant user reference is required']
    },
    claimAmount: {
      type: Number,
      required: [true, 'Claim amount is required'],
      min: [0, 'Claim amount cannot be negative']
    },
    approvedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Approved amount cannot be negative']
    },
    incidentDate: {
      type: Date,
      required: [true, 'Incident date is required']
    },
    incidentDescription: {
      type: String,
      required: [true, 'Incident description is required'],
      trim: true
    },
    incidentLocation: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Settled'],
        message: '{VALUE} is not a valid claim status'
      },
      default: 'Submitted'
    },
    reviewNotes: {
      type: String,
      trim: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    settlementDate: {
      type: Date
    },
    documents: [
      {
        name: { type: String, trim: true },
        url: { type: String, trim: true },
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
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

// Pre-validate hook to generate unique claimNumber if not provided
claimSchema.pre('validate', function () {
  if (!this.claimNumber) {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.claimNumber = `CLM-${Date.now().toString().slice(-4)}${randomHex}`;
  }
});

const Claim = mongoose.model('Claim', claimSchema);

module.exports = Claim;

