const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name field is required.']
  },
  email: {
    type: String,
    required: [true, 'Email field is required.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Invalid email address!"]
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Password is required.'],
    minLength: [8, "Password must be at least 8 characters."],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password.'],
    validate: {
      validator: function (cfm) {
        return cfm === this.password;
      },
      message: "Password are not the same."
    }
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // Delete this field from schema
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.validatePassword = async function (candidate, password) {
  return await bcrypt.compare(candidate, password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;