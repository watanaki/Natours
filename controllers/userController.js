const User = require('../Models/userModel');
const APIFeature = require('../Utils/apiFeatures');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');

const filterObj = (obj, ...allowedfields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedfields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

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

const updateMe = catchAsync(async (req, res) => {
  if (req.body.password || req.body.passwordConfirm)
    throw new AppError('This route is not for password updates.', 400);

  const filteredObj = filterObj(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser
    }
  });

});

const deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  console.log("deleteing...");


  res.status(204).json({
    status: "success",
    data: null
  });
});

module.exports = {
  getAllUsers,
  updateMe,
  deleteMe,
};