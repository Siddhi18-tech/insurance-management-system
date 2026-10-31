const express = require('express');
const router = express.Router();
const validateObjectId = require('../middlewares/validateObjectId');
const {
  createReminder,
  getReminders,
  updateReminderStatus,
  deleteReminder
} = require('../controllers/reminderController');

router.route('/')
  .post(createReminder)
  .get(getReminders);

router.route('/:id')
  .delete(validateObjectId('id'), deleteReminder);

router.patch('/:id/status', validateObjectId('id'), updateReminderStatus);

module.exports = router;

