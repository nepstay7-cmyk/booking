const express = require('express');
const { body, validationResult } = require('express-validator');
const Property = require('../models/Property');
const { protect, authorize, isPropertyOwner } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/properties
// @desc    Get all properties with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      city,
      type,
      minPrice,
      maxPrice,
      minRating,
      maxGuests,
      page = 1,
      limit = 12,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { isActive: true, isApproved: true };

    // Filters
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (type) query.type = type;
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }
    if (minRating) query['rating.average'] = { $gte: Number(minRating) };
    if (maxGuests) query.maxGuests = { $gte: Number(maxGuests) };

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const properties = await Property.find(query)
      .populate('owner', 'name email')
      .sort({ [sort]: sortOrder })
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

// @route   GET /api/properties/:id
// @desc    Get single property
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name avatar'
        }
      });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/properties
// @desc    Create new property
// @access  Private (Property Owner or Company Admin)
router.post('/', [
  protect,
  isPropertyOwner,
  body('name').notEmpty().withMessage('Property name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').isIn(['hotel', 'hostel']).withMessage('Type must be hotel or hostel'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('location.latitude').isNumeric().withMessage('Latitude is required'),
  body('location.longitude').isNumeric().withMessage('Longitude is required'),
  body('pricePerNight').isNumeric().withMessage('Price per night is required'),
  body('maxGuests').isInt({ min: 1 }).withMessage('Max guests must be at least 1'),
  body('rooms.total').isInt({ min: 1 }).withMessage('Total rooms must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // If user is property owner, check if verified
    if (req.user.role === 'propertyOwner' && !req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your account needs to be verified before creating properties'
      });
    }

    const propertyData = {
      ...req.body,
      owner: req.user._id,
      isApproved: req.user.role === 'companyAdmin' // Auto-approve for company admin
    };

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private (Property Owner or Company Admin)
router.put('/:id', [
  protect,
  isPropertyOwner
], async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership (unless company admin)
    if (req.user.role !== 'companyAdmin' && property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedProperty
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private (Property Owner or Company Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership (unless company admin)
    if (req.user.role !== 'companyAdmin' && property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/properties/owner/my-properties
// @desc    Get properties owned by current user
// @access  Private (Property Owner)
router.get('/owner/my-properties', protect, isPropertyOwner, async (req, res) => {
  try {
    const query = { owner: req.user._id };
    if (req.user.role !== 'companyAdmin') {
      // Property owners can only see their own properties
    }

    const properties = await Property.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('Get my properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;




