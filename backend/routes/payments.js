const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// @route   POST /api/payments/khalti
// @desc    Process Khalti payment
// @access  Private
router.post('/khalti', [
  protect,
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('token').notEmpty().withMessage('Payment token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { bookingId, token } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Verify payment with Khalti
    try {
      const response = await axios.post(
        'https://khalti.com/api/v2/payment/verify/',
        {
          token: token,
          amount: booking.totalAmount * 100 // Convert to paisa
        },
        {
          headers: {
            Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`
          }
        }
      );

      if (response.data.state.name === 'Completed') {
        booking.paymentStatus = 'completed';
        booking.paymentId = response.data.idx;
        booking.status = 'confirmed';
        await booking.save();

        // TODO: Send confirmation email

        return res.json({
          success: true,
          message: 'Payment successful',
          data: booking
        });
      }
    } catch (error) {
      console.error('Khalti payment verification error:', error);
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Khalti payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/payments/esewa
// @desc    Process eSewa payment
// @access  Private
router.post('/esewa', [
  protect,
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('transactionId').notEmpty().withMessage('Transaction ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { bookingId, transactionId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Verify payment with eSewa
    // Note: eSewa verification endpoint may vary
    // This is a simplified example
    try {
      // eSewa verification logic here
      // For now, we'll mark as completed
      booking.paymentStatus = 'completed';
      booking.paymentId = transactionId;
      booking.status = 'confirmed';
      await booking.save();

      // TODO: Send confirmation email

      return res.json({
        success: true,
        message: 'Payment successful',
        data: booking
      });
    } catch (error) {
      console.error('eSewa payment verification error:', error);
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('eSewa payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/payments/stripe
// @desc    Process Stripe payment
// @access  Private
router.post('/stripe', [
  protect,
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('paymentIntentId').notEmpty().withMessage('Payment Intent ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { bookingId, paymentIntentId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Verify payment with Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        booking.paymentStatus = 'completed';
        booking.paymentId = paymentIntentId;
        booking.status = 'confirmed';
        await booking.save();

        // TODO: Send confirmation email

        return res.json({
          success: true,
          message: 'Payment successful',
          data: booking
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Payment not completed'
        });
      }
    } catch (error) {
      console.error('Stripe payment verification error:', error);
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Stripe payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;




