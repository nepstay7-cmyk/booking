const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { protect, isPropertyOwner } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', [
  protect,
  body('property').notEmpty().withMessage('Property ID is required'),
  body('booking').notEmpty().withMessage('Booking ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { property, booking, rating, title, comment } = req.body;

    // Verify booking belongs to user
    const bookingDoc = await Booking.findById(booking);
    if (!bookingDoc) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (bookingDoc.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    if (bookingDoc.property.toString() !== property) {
      return res.status(400).json({
        success: false,
        message: 'Booking does not match property'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }

    // Create review
    const review = await Review.create({
      user: req.user._id,
      property,
      booking,
      rating,
      title,
      comment,
      isVerified: true
    });

    // Update property rating
    const propertyDoc = await Property.findById(property);
    const reviews = await Review.find({ property });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    propertyDoc.rating.average = totalRating / reviews.length;
    propertyDoc.rating.count = reviews.length;
    await propertyDoc.save();

    await review.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reviews/property/:propertyId
// @desc    Get reviews for a property
// @access  Public
router.get('/property/:propertyId', async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/reviews/:id/reply
// @desc    Reply to a review (property owner)
// @access  Private (Property Owner)
router.put('/:id/reply', [
  protect,
  isPropertyOwner,
  body('reply').notEmpty().withMessage('Reply text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if property owner owns this property (unless company admin)
    if (req.user.role !== 'companyAdmin') {
      const property = await Property.findById(review.property);
      if (property.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to reply to this review'
        });
      }
    }

    review.ownerReply = {
      text: req.body.reply,
      repliedAt: new Date()
    };

    await review.save();

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Reply to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;




