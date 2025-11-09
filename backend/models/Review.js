const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment']
  },
  ownerReply: {
    text: String,
    repliedAt: Date
  },
  isVerified: {
    type: Boolean,
    default: false // Verified if user completed the booking
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one review per booking
reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ property: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);




