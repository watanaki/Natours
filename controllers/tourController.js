const Tour = require('../Models/tourModel');
const APIFeature = require('../Utils/apiFeatures');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');



const updateTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

const getTopFive = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getAllTours = catchAsync(async (req, res) => {
  const features = new APIFeature(Tour.find(), req.query);
  features
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Execute query
  const tours = await features.query;

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: tours
  });
});

const createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

const getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    throw new AppError('No tour found with taht id', 404);
  }
  res.status(200).json({
    status: "succeed",
    data: {
      tour
    }
  });
  // try {
  // } catch (err) {
  //   res.status(404).json({
  //     status: "fail",
  //     message: err
  //   });
  // }
});

const deleteTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: 'success',
    deleted: tour
  });
});

const getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: stats
  });

  // try {
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err
  //   });
  // }
});

const getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: {
        numTourStarts: -1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: plan
  });
  // try {
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err
  //   });
  // }
});

module.exports = {
  updateTour,
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  getTopFive,
  getTourStats,
  getMonthlyPlan
};