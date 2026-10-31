const express = require('express');
const router = express.Router();
const validateObjectId = require('../middlewares/validateObjectId');
const {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPolicies,
  getUserClaims
} = require('../controllers/userController');

// Authentication routes
router.post('/login', loginUser);

// User collection routes
router.route('/')
  .post(createUser)
  .get(getUsers);

// Single user routes
router.route('/:id')
  .get(validateObjectId('id'), getUserById)
  .put(validateObjectId('id'), updateUser)
  .delete(validateObjectId('id'), deleteUser);

// User sub-resources
router.get('/:id/policies', validateObjectId('id'), getUserPolicies);
router.get('/:id/claims', validateObjectId('id'), getUserClaims);

module.exports = router;

