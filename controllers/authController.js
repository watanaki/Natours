const User = require('../Models/userModel');
const catchAsync = require('../Utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../Utils/appError');
require('dotenv').config();

/**
 * 
 * @param {object} payload 
 * @param {object} options 
 * @returns { string } 生成的的token
 */
const signToken = (payload, options) => {
  options ||= { expiresIn: process.env.JWT_EXPIRES_IN };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    options
  );
};

const signup = catchAsync(async (req, res) => {

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  try {
    const token = signToken({ id: newUser._id });

    res.status(201).json({
      status: 'success',
      token,
      data: { user: newUser },
    });

  } catch (err) {
    await User.findByIdAndDelete(newUser._id);
    throw err;
  }


});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new AppError("Please provide your email and password!", 400);

  const user = await User.findOne({ email }).select('+password');

  // User with given email does not exist
  if (!user)
    throw new AppError("Email not found!", 400);

  // Validate password
  const isPwdCorrect = await user.validatePassword(password, user.password);
  if (!isPwdCorrect)
    throw new AppError("Incorrect password!", 401);

  const token = signToken({ id: user._id });

  res.status(200).json({
    status: 'success',
    token
  });

});

const validate = catchAsync(async (req, res, next) => {
  // Get token


  // Validate token


  // Check user existence


  // If password is changed after the token was issued


  next();

});


module.exports = {
  signup,
  login,
  validate,
};