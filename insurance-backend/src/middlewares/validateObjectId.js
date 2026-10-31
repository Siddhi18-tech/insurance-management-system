const mongoose = require('mongoose');

// Middleware to validate one or more route parameters as valid MongoDB ObjectIds
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ObjectId format for parameter '${paramName}': ${id}`
      });
    }
    next();
  };
};

module.exports = validateObjectId;

