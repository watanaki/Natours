/* const getBase = (req, res) => {
  res.status(200).render('base', {
    title: 'Exciting tours for adventurous people'
  });
}; */

const Tour = require("../Models/tourModel");
const catchAsync = require("../Utils/catchAsync");

const getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

const getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate('reviews');

  res.status(200).render('tour', {
    title: tour.name,
    tour
  });
});

module.exports = {
  getOverview,
  getTour
};