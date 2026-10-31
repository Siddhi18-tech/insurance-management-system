const express = require('express');
const router = express.Router();
const validateObjectId = require('../middlewares/validateObjectId');
const {
  createClaim,
  getClaims,
  getClaimById,
  updateClaim,
  updateClaimStatus,
  deleteClaim
} = require('../controllers/claimController');

// Claim collection routes
router.route('/')
  .post(createClaim)
  .get(getClaims);

// Single claim routes
router.route('/:id')
  .get(validateObjectId('id'), getClaimById)
  .put(validateObjectId('id'), updateClaim)
  .delete(validateObjectId('id'), deleteClaim);

// Specialized status transition route
router.patch('/:id/status', validateObjectId('id'), updateClaimStatus);

module.exports = router;

