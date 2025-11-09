const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  protect,
  body('name').optional().trim(),
  body('phone').optional().trim(),
  body('email').optional().isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, phone, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      updateData.email = email;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/verify-documents
// @desc    Upload verification documents (for property owners)
// @access  Private (Property Owner)
router.post('/verify-documents', [
  protect,
  upload.fields([
    { name: 'businessRegistration', maxCount: 1 },
    { name: 'citizenshipId', maxCount: 1 }
  ])
], async (req, res) => {
  try {
    if (req.user.role !== 'propertyOwner') {
      return res.status(403).json({
        success: false,
        message: 'Only property owners can upload verification documents'
      });
    }

    const updateData = {
      'verificationDocuments.status': 'pending'
    };

    if (req.files.businessRegistration) {
      updateData['verificationDocuments.businessRegistration'] = req.files.businessRegistration[0].path;
    }

    if (req.files.citizenshipId) {
      updateData['verificationDocuments.citizenshipId'] = req.files.citizenshipId[0].path;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Documents uploaded successfully. Please wait for verification.',
      data: user
    });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

