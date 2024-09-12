const User = require('../Models/userModel');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const sendEmail = require('../Utils/email');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

/**
 * 
 * @param {object} payload Must be an object
 * @param {object} options 
 * @returns { string } 生成的的token
 */
const signToken = (payload, options) => {
  if (typeof payload !== 'object')
    throw new Error('payload must be an object!');

  options ||= { expiresIn: process.env.JWT_EXPIRES_IN };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    options
  );
};

const sendToken = (user, statusCode, res, sendData = { user }) => {
  const token = signToken({ id: user.id });

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // Don't show password in json response
  sendData.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: sendData

  });
};

const signup = catchAsync(async (req, res) => {

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });

  try {
    sendToken(newUser, 201, res);
    // const token = signToken({ id: newUser._id });

    // res.status(201).json({
    //   status: 'success',
    //   token,
    //   data: { user: newUser },
    // });

  } catch (err) {
    await User.findByIdAndDelete(newUser._id);
    throw err;
  }


});

const login = catchAsync(async (req, res) => {
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

  sendToken(user, 200, res, {});

  // const token = signToken({ id: user._id });

  // res.status(200).json({
  //   status: 'success',
  //   token
  // });

});

const validate = catchAsync(async (req, res, next) => {
  // Get token
  let auth = req.headers.authorization;
  let token = undefined;
  if (auth && auth.startsWith('Bearer'))
    token = auth.split(' ')[1];

  if (!token)
    throw new AppError('You are not logged in!', 401);

  // Validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check user existence
  const user = await User.findById(decoded.id);
  if (!user) throw new AppError("The user belonging to this token does no longer exist", 401);


  // If password is changed after the token was issued
  if (user.isPwdChangedAfter(decoded.iat))
    throw new AppError("Password changed, this token was expired", 401);

  req.user = user;
  next();

});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      throw new AppError("Permission denied");

    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  // Get the user
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new AppError("User not found", 404);

  // Generate random token
  const resetToken = user.createPwdResetToken();
  await user.save({ validateBeforeSave: false });

  // Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forget your password? Click here: ${resetURL} to reset.\nIf you didn't request for a password reset, please just ignore this.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your passwprd reset token(Valid for ten miuntes)",
      message
    });

    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    next(new AppError("There's an error occours while sending email", 500));
  }

  res.status(200).json({
    status: "success",
    message: "Email sended!"
  });

});

const resetPassword = catchAsync(async (req, res, next) => {
  // Encrypt the received token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // Find the user with the same encrypted token and that token should not expired yet.
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) return next(new AppError("Token is invalid or has expired", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendToken(user, 200, res, {});

  // const token = signToken({ id: user.id });

  // res.status(200).json({
  //   status: 'success',
  //   token
  // });

});

const updatePassword = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new AppError('User not found, please log in again.', 401);

  if (!await user.validatePassword(req.body.password, user.password))
    throw new AppError("Password mismatch!");

  user.password = req.body.newPwd;
  user.passwordConfirm = req.body.newPwdConfirm;

  await user.save();

  sendToken(user, 200, res, {});
  // const token = signToken({ id: user.id });

  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });




});


module.exports = {
  signup,
  login,
  validate,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};