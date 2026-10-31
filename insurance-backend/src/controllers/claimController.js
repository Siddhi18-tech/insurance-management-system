const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    File a new insurance claim
// @route   POST /api/claims
// @access  Public
const createClaim = asyncHandler(async (req, res) => {
  const {
    claimNumber,
    policy: policyId,
    user: userId,
    claimAmount,
    incidentDate,
    incidentDescription,
    incidentLocation,
    documents
  } = req.body;

  // 1. Verify policy exists
  const policy = await Policy.findById(policyId);
  if (!policy) {
    return res.status(404).json({
      success: false,
      error: `Policy not found with id: ${policyId}`
    });
  }

  // 2. Verify claimant user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: `Claimant user not found with id: ${userId}`
    });
  }

  // 3. Verify user is the policyholder or an authorized user
  if (policy.user.toString() !== userId.toString()) {
    return res.status(400).json({
      success: false,
      error: 'The specified user is not the registered policyholder for this policy'
    });
  }

  // 4. Verify policy status is Active
  if (policy.status !== 'Active') {
    return res.status(400).json({
      success: false,
      error: `Cannot file claim: policy is currently '${policy.status}'. Only Active policies can have claims filed.`
    });
  }

  // 5. Verify claim amount does not exceed policy coverage amount
  if (Number(claimAmount) > policy.coverageAmount) {
    return res.status(400).json({
      success: false,
      error: `Claim amount ($${claimAmount}) cannot exceed the policy coverage limit ($${policy.coverageAmount})`
    });
  }

  // 6. Check unique claim number if manually supplied
  if (claimNumber) {
    const existing = await Claim.findOne({ claimNumber: claimNumber.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Claim number '${claimNumber}' already exists`
      });
    }
  }

  const claim = await Claim.create({
    claimNumber,
    policy: policyId,
    user: userId,
    claimAmount,
    incidentDate,
    incidentDescription,
    incidentLocation,
    documents: documents || []
  });

  const populatedClaim = await Claim.findById(claim._id)
    .populate('policy', 'policyNumber title policyType coverageAmount status')
    .populate('user', 'name email phone');

  res.status(201).json({
    success: true,
    message: 'Claim submitted successfully',
    data: populatedClaim
  });
});

// @desc    Get all claims with filtering, pagination, and sorting
// @route   GET /api/claims
// @access  Public
const getClaims = asyncHandler(async (req, res) => {
  const {
    status,
    policy,
    user,
    search,
    minAmount,
    maxAmount,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (policy) {
    query.policy = policy;
  }

  if (user) {
    query.user = user;
  }

  if (minAmount) {
    query.claimAmount = { ...query.claimAmount, $gte: Number(minAmount) };
  }

  if (maxAmount) {
    query.claimAmount = { ...query.claimAmount, $lte: Number(maxAmount) };
  }

  if (search) {
    query.$or = [
      { claimNumber: { $regex: search, $options: 'i' } },
      { incidentDescription: { $regex: search, $options: 'i' } },
      { incidentLocation: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [claims, total] = await Promise.all([
    Claim.find(query)
      .populate('policy', 'policyNumber title policyType coverageAmount status')
      .populate('user', 'name email phone')
      .populate('reviewedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Claim.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: claims.length,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum
    },
    data: claims
  });
});

// @desc    Get single claim by ID
// @route   GET /api/claims/:id
// @access  Public
const getClaimById = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id)
    .populate('policy')
    .populate('user', 'name email phone address')
    .populate('reviewedBy', 'name email role');

  if (!claim) {
    return res.status(404).json({
      success: false,
      error: `Claim not found with id: ${req.params.id}`
    });
  }

  res.status(200).json({
    success: true,
    data: claim
  });
});

// @desc    Update claim details
// @route   PUT /api/claims/:id
// @access  Public
const updateClaim = asyncHandler(async (req, res) => {
  // Disallow direct status or financial tampering through general PUT
  const updates = { ...req.body };
  delete updates.claimNumber; // Immutability of claim identification

  const claim = await Claim.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  })
    .populate('policy', 'policyNumber title policyType')
    .populate('user', 'name email');

  if (!claim) {
    return res.status(404).json({
      success: false,
      error: `Claim not found with id: ${req.params.id}`
    });
  }

  res.status(200).json({
    success: true,
    message: 'Claim updated successfully',
    data: claim
  });
});

// @desc    Update claim adjudication status (review / approve / reject / settle)
// @route   PATCH /api/claims/:id/status
// @access  Public
const updateClaimStatus = asyncHandler(async (req, res) => {
  const { status, approvedAmount, reviewNotes, reviewedBy, settlementDate } = req.body;

  const validStatuses = ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Settled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  const claim = await Claim.findById(req.params.id);
  if (!claim) {
    return res.status(404).json({
      success: false,
      error: `Claim not found with id: ${req.params.id}`
    });
  }

  claim.status = status;

  if (typeof reviewNotes !== 'undefined') {
    claim.reviewNotes = reviewNotes;
  }

  if (reviewedBy) {
    const reviewer = await User.findById(reviewedBy);
    if (!reviewer) {
      return res.status(404).json({
        success: false,
        error: `Reviewer user not found with id: ${reviewedBy}`
      });
    }
    claim.reviewedBy = reviewedBy;
  }

  if (typeof approvedAmount !== 'undefined') {
    if (approvedAmount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Approved amount cannot be negative'
      });
    }
    claim.approvedAmount = approvedAmount;
  }

  if (status === 'Settled') {
    claim.settlementDate = settlementDate ? new Date(settlementDate) : new Date();
  }

  await claim.save();

  const updatedClaim = await Claim.findById(claim._id)
    .populate('policy', 'policyNumber title')
    .populate('user', 'name email')
    .populate('reviewedBy', 'name email role');

  res.status(200).json({
    success: true,
    message: `Claim status transitioned to '${status}' successfully`,
    data: updatedClaim
  });
});

// @desc    Delete claim by ID
// @route   DELETE /api/claims/:id
// @access  Public
const deleteClaim = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id);

  if (!claim) {
    return res.status(404).json({
      success: false,
      error: `Claim not found with id: ${req.params.id}`
    });
  }

  // Prevent deleting settled claims for audit compliance
  if (claim.status === 'Settled') {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete settled claims. Settled claims must be preserved for audit and accounting purposes.'
    });
  }

  await claim.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Claim deleted successfully',
    data: {}
  });
});

module.exports = {
  createClaim,
  getClaims,
  getClaimById,
  updateClaim,
  updateClaimStatus,
  deleteClaim
};

