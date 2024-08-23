const User = require('../Models/userModel');
const APIFeature = require('../Utils/apiFeatures');
// const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');

const getAllUsers = catchAsync(async (req, res) => {
  const features = new APIFeature(User.find(), req.query);
  features
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;

  res.status(200).json({
    status: "success",
    results: users.length,
    data: users
  });
});


module.exports = {
  getAllUsers,
};