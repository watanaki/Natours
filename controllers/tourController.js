const Tour = require('../Models/tourModel');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');
const factory = require('./handlerFactory');


const updateTour = factory.updateOne(Tour);
const createTour = factory.createOne(Tour);
const deleteTour = factory.deleteOne(Tour);
const getAllTours = factory.getAll(Tour);
const getTour = factory.getOne(Tour, "reviews");

const getTopFive = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};


/* const deleteTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: 'success',
    deleted: tour
  });
}); */


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

const getToursWithin = catchAsync(async (req, res) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!(lat && lng))
    throw new AppError('Please provide your latitude and longitude!', 400);

  const radius = distance / (unit === 'mi' ? 3963.2 : 6378.1);

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius]
      }
    }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });


});

const getDistances = catchAsync(async (req, res) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!(lat && lng))
    throw new AppError('Please provide your latitude and longitude!', 400);

  const distanceMultiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const distances = await Tour.aggregate([
    {
      // This must be the first stage of the aggregation pipeline.
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distances',
        distanceMultiplier
      }
    },
    {
      $project: {
        distances: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });

});

module.exports = {
  updateTour,
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  getTopFive,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
};