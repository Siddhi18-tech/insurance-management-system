const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Create a new user
// @route   POST /api/users
// @access  Public
const createUser = asyncHandler(async (req, res) => {
  let { name, email, password, phone, role, dateOfBirth, address, isActive } = req.body;

  if (!name || !password) {
    return res.status(400).json({
      success: false,
      error: 'Name and password are required'
    });
  }

  // If email is not provided, generate a unique valid email based on name
  if (!email || !email.trim()) {
    const sanitized = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    email = `${sanitized}.${Date.now().toString().slice(-4)}${randomSuffix}@insurance.local`;
  }

  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [
      { email: email.toLowerCase() },
      { name: name.trim() }
    ]
  });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: `User with this name or email already exists`
    });
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password,
    phone,
    role: role || 'customer',
    dateOfBirth,
    address,
    isActive: typeof isActive !== 'undefined' ? isActive : true
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user
  });
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if ((!email && !name) || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide name or email, and password'
    });
  }

  const queryConditions = [];
  if (email && email.trim()) {
    queryConditions.push({ email: email.trim().toLowerCase() });
  }
  if (name && name.trim()) {
    queryConditions.push({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
  }

  const user = await User.findOne({ $or: queryConditions }).select('+password');

  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials. Please check your username/email and password.'
    });
  }

  const userObj = user.toJSON();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: userObj
  });
});

// @desc    Get all users with optional filtering & pagination
// @route   GET /api/users
// @access  Public
const getUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search, page = 1, limit = 10 } = req.query;

  const query = {};

  if (role) {
    query.role = role;
  }

  if (typeof isActive !== 'undefined') {
    query.isActive = isActive === 'true';
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum
    },
    data: users
  });
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: `User not found with id: ${req.params.id}`
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user by ID
// @route   PUT /api/users/:id
// @access  Public
const updateUser = asyncHandler(async (req, res) => {
  // Prevent updating password through this route (if provided)
  const updates = { ...req.body };
  delete updates.password;

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: `User not found with id: ${req.params.id}`
    });
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

// @desc    Delete user by ID
// @route   DELETE /api/users/:id
// @access  Public
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: `User not found with id: ${req.params.id}`
    });
  }

  // Check if user has active policies or claims before deleting
  const [activePoliciesCount, activeClaimsCount] = await Promise.all([
    Policy.countDocuments({ user: user._id, status: 'Active' }),
    Claim.countDocuments({ user: user._id, status: { $in: ['Submitted', 'Under Review', 'Approved'] } })
  ]);

  if (activePoliciesCount > 0 || activeClaimsCount > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete user: user has ${activePoliciesCount} active policy(ies) and ${activeClaimsCount} pending/active claim(s). Deactivate the user instead or delete associated records first.`
    });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: {}
  });
});

// @desc    Get all policies of a user
// @route   GET /api/users/:id/policies
// @access  Public
const getUserPolicies = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: `User not found with id: ${req.params.id}`
    });
  }

  const policies = await Policy.find({ user: req.params.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: policies.length,
    data: policies
  });
});

// @desc    Get all claims of a user
// @route   GET /api/users/:id/claims
// @access  Public
const getUserClaims = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: `User not found with id: ${req.params.id}`
    });
  }

  const claims = await Claim.find({ user: req.params.id })
    .populate('policy', 'policyNumber title policyType status')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: claims.length,
    data: claims
  });
});

module.exports = {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPolicies,
  getUserClaims
};

