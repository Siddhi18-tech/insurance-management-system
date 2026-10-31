const express = require('express');
const router = express.Router();
const validateObjectId = require('../middlewares/validateObjectId');
const {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
  getPolicyClaims
} = require('../controllers/policyController');

// Policy collection routes
router.route('/')
  .post(createPolicy)
  .get(getPolicies);

// Single policy routes
router.route('/:id')
  .get(validateObjectId('id'), getPolicyById)
  .put(validateObjectId('id'), updatePolicy)
  .delete(validateObjectId('id'), deletePolicy);

// Policy sub-resources
router.get('/:id/claims', validateObjectId('id'), getPolicyClaims);

module.exports = router;

