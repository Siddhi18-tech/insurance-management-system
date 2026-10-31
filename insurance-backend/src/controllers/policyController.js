const Policy = require('../models/Policy');
const User = require('../models/User');
const Claim = require('../models/Claim');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Create a new policy
// @route   POST /api/policies
// @access  Public
const createPolicy = asyncHandler(async (req, res) => {
  const {
    policyNumber,
    title,
    policyType,
    description,
    premiumAmount,
    coverageAmount,
    deductibleAmount,
    paymentFrequency,
    termMonths,
    startDate,
    endDate,
    status,
    user,
    agent,
    nomineeName,
    nomineeRelation
  } = req.body;

  // Verify that the user (policyholder) exists
  const policyholder = await User.findById(user);
  if (!policyholder) {
    return res.status(404).json({
      success: false,
      error: `Policyholder user not found with id: ${user}`
    });
  }

  // If an agent is assigned, verify agent exists
  if (agent) {
    const assignedAgent = await User.findById(agent);
    if (!assignedAgent) {
      return res.status(404).json({
        success: false,
        error: `Agent user not found with id: ${agent}`
      });
    }
  }

  // Check for duplicate policyNumber if supplied manually
  if (policyNumber) {
    const existing = await Policy.findOne({ policyNumber: policyNumber.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Policy number '${policyNumber}' is already in use`
      });
    }
  }

  const policy = await Policy.create({
    policyNumber,
    title,
    policyType,
    description,
    premiumAmount,
    coverageAmount,
    deductibleAmount,
    paymentFrequency,
    termMonths,
    startDate,
    endDate,
    status,
    user,
    agent,
    nomineeName: nomineeName || '',
    nomineeRelation: nomineeRelation || ''
  });

  const populatedPolicy = await Policy.findById(policy._id)
    .populate('user', 'name email phone')
    .populate('agent', 'name email');

  res.status(201).json({
    success: true,
    message: 'Policy created successfully',
    data: populatedPolicy
  });
});

// @desc    Get all policies with filtering, pagination, and sorting
// @route   GET /api/policies
// @access  Public
const getPolicies = asyncHandler(async (req, res) => {
  const {
    policyType,
    status,
    user,
    search,
    minCoverage,
    maxPremium,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  if (policyType) {
    query.policyType = policyType;
  }

  if (status) {
    query.status = status;
  }

  if (user) {
    query.user = user;
  }

  if (minCoverage) {
    query.coverageAmount = { ...query.coverageAmount, $gte: Number(minCoverage) };
  }

  if (maxPremium) {
    query.premiumAmount = { ...query.premiumAmount, $lte: Number(maxPremium) };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { policyNumber: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [policies, total] = await Promise.all([
    Policy.find(query)
      .populate('user', 'name email phone role')
      .populate('agent', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Policy.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: policies.length,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum
    },
    data: policies
  });
});

// @desc    Get single policy by ID
// @route   GET /api/policies/:id
// @access  Public
const getPolicyById = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.params.id)
    .populate('user', 'name email phone address')
    .populate('agent', 'name email phone');

  if (!policy) {
    return res.status(404).json({
      success: false,
      error: `Policy not found with id: ${req.params.id}`
    });
  }

  res.status(200).json({
    success: true,
    data: policy
  });
});

// @desc    Update policy by ID
// @route   PUT /api/policies/:id
// @access  Public
const updatePolicy = asyncHandler(async (req, res) => {
  // If user or agent is updated, check that they exist
  if (req.body.user) {
    const policyholder = await User.findById(req.body.user);
    if (!policyholder) {
      return res.status(404).json({
        success: false,
        error: `Policyholder user not found with id: ${req.body.user}`
      });
    }
  }

  if (req.body.agent) {
    const assignedAgent = await User.findById(req.body.agent);
    if (!assignedAgent) {
      return res.status(404).json({
        success: false,
        error: `Agent user not found with id: ${req.body.agent}`
      });
    }
  }

  const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('user', 'name email phone')
    .populate('agent', 'name email');

  if (!policy) {
    return res.status(404).json({
      success: false,
      error: `Policy not found with id: ${req.params.id}`
    });
  }

  res.status(200).json({
    success: true,
    message: 'Policy updated successfully',
    data: policy
  });
});

// @desc    Delete policy by ID
// @route   DELETE /api/policies/:id
// @access  Public
const deletePolicy = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.params.id);

  if (!policy) {
    return res.status(404).json({
      success: false,
      error: `Policy not found with id: ${req.params.id}`
    });
  }

  // Check if claims exist under this policy
  const associatedClaimsCount = await Claim.countDocuments({ policy: policy._id });
  if (associatedClaimsCount > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete policy: ${associatedClaimsCount} claim(s) are associated with this policy. Delete or archive claims first, or change policy status to 'Cancelled'.`
    });
  }

  await policy.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Policy deleted successfully',
    data: {}
  });
});

// @desc    Get all claims for a specific policy
// @route   GET /api/policies/:id/claims
// @access  Public
const getPolicyClaims = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.params.id);
  if (!policy) {
    return res.status(404).json({
      success: false,
      error: `Policy not found with id: ${req.params.id}`
    });
  }

  const claims = await Claim.find({ policy: req.params.id })
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: claims.length,
    data: claims
  });
});

module.exports = {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
  getPolicyClaims
};

