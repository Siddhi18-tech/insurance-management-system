const Reminder = require('../models/Reminder');
const Policy = require('../models/Policy');
const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Create a new reminder
// @route   POST /api/reminders
// @access  Public
const createReminder = asyncHandler(async (req, res) => {
  const { user: userId, policy: policyId, title, dueDate, amount, note } = req.body;

  if (!userId || !policyId || !dueDate || typeof amount === 'undefined') {
    return res.status(400).json({
      success: false,
      error: 'User, policy, dueDate, and amount are required fields'
    });
  }

  // Verify policy exists
  const policy = await Policy.findById(policyId);
  if (!policy) {
    return res.status(404).json({
      success: false,
      error: `Policy not found with id: ${policyId}`
    });
  }

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: `User not found with id: ${userId}`
    });
  }

  // Check if active reminder already exists for this policy and due date
  const parsedDueDate = new Date(dueDate);
  const existingReminder = await Reminder.findOne({
    user: userId,
    policy: policyId,
    status: 'Active'
  });

  let reminder;
  if (existingReminder) {
    // Update existing active reminder with new due date / amount
    existingReminder.dueDate = parsedDueDate;
    existingReminder.amount = Number(amount);
    existingReminder.title = title || `Premium Due: ${policy.title}`;
    if (note) existingReminder.note = note;
    await existingReminder.save();
    reminder = existingReminder;
  } else {
    reminder = await Reminder.create({
      user: userId,
      policy: policyId,
      title: title || `Premium Due: ${policy.title}`,
      dueDate: parsedDueDate,
      amount: Number(amount),
      note: note || '',
      status: 'Active'
    });
  }

  const populatedReminder = await Reminder.findById(reminder._id)
    .populate('policy', 'title policyNumber policyType paymentFrequency')
    .populate('user', 'name email');

  res.status(201).json({
    success: true,
    message: 'Reminder set successfully',
    data: populatedReminder
  });
});

// @desc    Get reminders for user
// @route   GET /api/reminders
// @access  Public
const getReminders = asyncHandler(async (req, res) => {
  const { user, status } = req.query;

  const query = {};
  if (user) {
    query.user = user;
  }
  if (status) {
    query.status = status;
  }

  const reminders = await Reminder.find(query)
    .populate('policy', 'title policyNumber policyType paymentFrequency premiumAmount')
    .populate('user', 'name email')
    .sort({ dueDate: 1 });

  res.status(200).json({
    success: true,
    count: reminders.length,
    data: reminders
  });
});

// @desc    Update reminder status (e.g. Dismiss / Mark Paid)
// @route   PATCH /api/reminders/:id/status
// @access  Public
const updateReminderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['Active', 'Dismissed', 'Paid'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status. Must be Active, Dismissed, or Paid'
    });
  }

  const reminder = await Reminder.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('policy', 'title policyNumber');

  if (!reminder) {
    return res.status(404).json({
      success: false,
      error: `Reminder not found with id: ${req.params.id}`
    });
  }

  res.status(200).json({
    success: true,
    message: `Reminder updated to ${status}`,
    data: reminder
  });
});

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Public
const deleteReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findById(req.params.id);

  if (!reminder) {
    return res.status(404).json({
      success: false,
      error: `Reminder not found with id: ${req.params.id}`
    });
  }

  await reminder.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Reminder deleted successfully',
    data: {}
  });
});

module.exports = {
  createReminder,
  getReminders,
  updateReminderStatus,
  deleteReminder
};

