const express = require('express');
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { protect, isCompanyAdmin, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require company admin role
router.use(protect);
router.use(isCompanyAdmin);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Company Admin)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingProperties = await Property.countDocuments({ isApproved: false });
    const pendingOwners = await User.countDocuments({
      role: 'propertyOwner',
      'verificationDocuments.status': 'pending'
    });

    // Revenue calculation
    const bookings = await Booking.find({ paymentStatus: 'completed', status: { $ne: 'cancelled' } });
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    // Top cities
    const properties = await Property.find({ isApproved: true });
    const cityCounts = {};
    properties.forEach(prop => {
      const city = prop.address.city;
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProperties,
        totalBookings,
        pendingProperties,
        pendingOwners,
        totalRevenue,
        topCities
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Company Admin)
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify/Approve property owner
// @access  Private (Company Admin)
router.put('/users/:id/verify', async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'propertyOwner') {
      return res.status(400).json({
        success: false,
        message: 'User is not a property owner'
      });
    }

    user.verificationDocuments.status = status;
    if (status === 'approved') {
      user.isVerified = true;
    }

    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/properties
// @desc    Get all properties (including unapproved)
// @access  Private (Company Admin)
router.get('/properties', async (req, res) => {
  try {
    const { isApproved, page = 1, limit = 20 } = req.query;
    const query = {};
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';

    const skip = (page - 1) * limit;
    const properties = await Property.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Property.countDocuments(query);

    res.json({
      success: true,
      count: properties.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: properties
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/properties/:id/approve
// @desc    Approve/Reject property
// @access  Private (Company Admin)
router.put('/properties/:id/approve', async (req, res) => {
  try {
    const { isApproved } = req.body;

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    property.isApproved = isApproved;
    await property.save();

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Approve property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings
// @access  Private (Company Admin)
router.get('/bookings', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const bookings = await Booking.find(query)
      .populate('property', 'name address')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
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

module.exports = router;




