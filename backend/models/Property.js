const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a property name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  type: {
    type: String,
    enum: ['hotel', 'hostel'],
    required: true
  },
  address: {
    street: String,
    city: {
      type: String,
      required: true,
      trim: true
    },
    district: String,
    province: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Nepal'
    }
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    placeId: String // Google Places ID
  },
  amenities: [{
    type: String
  }],
  images: [{
    url: String,
    alt: String
  }],
  pricePerNight: {
    type: Number,
    required: [true, 'Please provide price per night'],
    min: [0, 'Price must be positive']
  },
  maxGuests: {
    type: Number,
    required: true,
    min: 1
  },
  rooms: {
    total: {
      type: Number,
      required: true,
      min: 1
    },
    available: {
      type: Number,
      default: function() {
        return this.rooms.total;
      }
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  policies: {
    checkIn: String,
    checkOut: String,
    cancellation: String
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

// Update updatedAt before saving
propertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search
propertySchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
propertySchema.index({ 'address.city': 1 });
propertySchema.index({ type: 1, isActive: 1, isApproved: 1 });

module.exports = mongoose.model('Property', propertySchema);




