const AppError = require("../Utils/appError");
const catchAsync = require("../Utils/catchAsync");
const APIFeature = require('../Utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req, res) => {
  const document = await Model.findByIdAndDelete(req.params.id);

  if (!document) throw new AppError("No document found with that id", 404);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createOne = Model => catchAsync(async (req, res) => {
  const newDoc = await Model.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      data: newDoc
    }
  });
});

exports.updateOne = Model => catchAsync(async (req, res) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});

exports.getOne = (Model, popuOptions) => catchAsync(async (req, res) => {
  const query = Model.findById(req.params.id);
  if (popuOptions) query.populate(popuOptions);
  const data = await query;
  if (!data) {
    throw new AppError('No document found with taht id', 404);
  }
  res.status(200).json({
    status: "succeed",
    data: {
      data
    }
  });
});

exports.getAll = (Model, findObj = {}) => catchAsync(async (req, res) => {
  const features = new APIFeature(Model.find(findObj), req.query);
  features
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const data = await features.query;

  res.status(200).json({
    status: "success",
    results: data.length,
    data
  });
});