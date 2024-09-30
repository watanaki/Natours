const User = require('../Models/userModel');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedfields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedfields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

const getAllUsers = factory.getAll(User);
const updateUser = factory.updateOne(User);
const deleteUser = factory.deleteOne(User);
const getUser = factory.getOne(User);

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

  res.status(204).json({
    status: "success",
    data: null
  });
});

const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

module.exports = {
  getAllUsers,
  updateMe,
  deleteMe,
  updateUser,
  deleteUser,
  getMe,
  getUser,
};