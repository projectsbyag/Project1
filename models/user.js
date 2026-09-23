const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide your first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide your last name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  profilePicture: {
    type: String,
    default: 'default.jpg',
    validate: {
        validator: function(value) {
            // Allow default.jpg or proper file extensions
            if (value === 'default.jpg') return true;
            const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
            const extension = value.split('.').pop().toLowerCase();
            return validExtensions.includes(extension);
        },
        message: 'Invalid image file format. Supported formats: JPG, JPEG, PNG, GIF'
    }
},
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [false, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
    // Notification settings
    notificationSettings: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        emailAssignmentReminders: {
            type: Boolean,
            default: true
        },
        emailCourseAnnouncements: {
            type: Boolean,
            default: true
        },
        emailDiscussionReplies: {
            type: Boolean,
            default: true
        }
    },
    
    // Language preferences
    language: {
        type: String,
        default: 'en'  // ISO 639-1 language code
    },
    region: {
        type: String,
        default: 'US'  // ISO 3166-1 alpha-2 country code
    },
    dateFormat: {
        type: String,
        enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
        default: 'MM/DD/YYYY'
    },
    timeFormat: {
        type: String,
        enum: ['12h', '24h'],
        default: '12h'
    },
  major: String,
  enrolledCourses: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Course'
  }],
  passwordChangedAt: Date,
  lastLogin: Date,
  totalLogins: {
    type: Number,
    default: 0
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
  
});

// Virtual property for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual property for profile picture URL
userSchema.virtual('profilePictureUrl').get(function() {
  if (this.profilePicture && this.profilePicture !== 'default.jpg' && this.profilePicture !== 'default.png') {
    if (this.profilePicture.startsWith('http')) return this.profilePicture;
    return `/uploads/profile/${this.profilePicture}`;
  }
  return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';
});
// Encrypt password before saving
userSchema.pre('save', async function(next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();
  
  // Hash the password
  this.password = await bcrypt.hash(this.password, 12);
  
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// Method to compare passwords
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;