const Review = require('../Models/reviewModel');
const APIFeatures = require('../Utils/apiFeatures');
const catchAsync = require('../Utils/catchAsync');
const factory = require('./handlerFactory');

const getAllReviews = catchAsync(async (req, res) => {
  const { tourId } = req.params;
  const filter = tourId ? { tour: tourId } : {};
  const features = new APIFeatures(Review.find(filter), req.query);

  features
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await features.query;

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: reviews
  });
});

const createReview = catchAsync(async (req, res) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;

  const review = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      review
    }
  });
});

const deleteReview = factory.deleteOne(Review);
const updateReview = factory.updateOne(Review);
const getReview = factory.getOne(Review);

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  getReview,
};