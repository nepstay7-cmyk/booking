const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { protect, authorize, isPropertyOwner } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', [
  protect,
  body('property').notEmpty().withMessage('Property ID is required'),
  body('checkIn').isISO8601().withMessage('Valid check-in date is required'),
  body('checkOut').isISO8601().withMessage('Valid check-out date is required'),
  body('guests').isInt({ min: 1 }).withMessage('Guests must be at least 1'),
  body('rooms').isInt({ min: 1 }).withMessage('Rooms must be at least 1'),
  body('paymentMethod').isIn(['khalti', 'esewa', 'stripe', 'cash']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { property, checkIn, checkOut, guests, rooms, paymentMethod, specialRequests, contactInfo } = req.body;

    // Check if property exists
    const propertyDoc = await Property.findById(property);
    if (!propertyDoc) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Check if property can accommodate guests
    if (guests > propertyDoc.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `Property can only accommodate ${propertyDoc.maxGuests} guests`
      });
    }

    // Check availability (simplified - in production, check for overlapping bookings)
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalAmount = propertyDoc.pricePerNight * nights * rooms;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      property,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      rooms,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
      contactInfo: contactInfo || {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      },
      specialRequests
    });

    // Populate property and user data
    await booking.populate('property', 'name address images pricePerNight');
    await booking.populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const query = { user: req.user._id };

    // If property owner or admin, show bookings for their properties
    if (req.user.role === 'propertyOwner' || req.user.role === 'companyAdmin') {
      if (req.user.role === 'propertyOwner') {
        // Get property owner's properties
        const properties = await Property.find({ owner: req.user._id }).select('_id');
        const propertyIds = properties.map(p => p._id);
        query.property = { $in: propertyIds };
      } else {
        // Company admin can see all bookings
        delete query.user;
      }
    }

    const bookings = await Booking.find(query)
      .populate('property', 'name address images')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isPropertyOwner = req.user.role === 'propertyOwner' || req.user.role === 'companyAdmin';
    
    if (!isOwner && !isPropertyOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', [
  protect,
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isOwner = booking.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'companyAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'Cancelled by user';

    await booking.save();

    res.json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (for property owners/admins)
// @access  Private (Property Owner or Company Admin)
router.put('/:id/status', [
  protect,
  authorize('propertyOwner', 'companyAdmin'),
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if property owner owns this property (unless company admin)
    if (req.user.role === 'propertyOwner') {
      const property = await Property.findById(booking.property);
      if (property.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this booking'
        });
      }
    }

    booking.status = req.body.status;
    if (req.body.status === 'cancelled') {
      booking.cancelledAt = new Date();
      booking.cancellationReason = req.body.reason || 'Cancelled by property owner';
    }

    await booking.save();

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;




