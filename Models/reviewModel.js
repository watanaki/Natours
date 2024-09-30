const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "Review content can not be empty!"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, "Review must belongs to a tour!"]
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, "Review must belongs to a user!"]
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  /* this.populate({
    path: 'tour',
    select: 'name'
  }) */
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0]?.avgRating || 4.5,
    ratingsQuantity: stats[0]?.nRating || 0
  });
};

reviewSchema.post('save', function (next) {
  Review.calcAverageRatings(this.tour);
});

/**This is a query middleware, so the 'this' keyword here refers to the
 * current query but not the current document, so we have to explicitly
 * execute a query to get the document cause we need the tour id of this 
 * updating review. You can not do something like this in a post middleware
 * because the query is already being executed at that time, you can't execute
 * a query twice, so we need to get the tour id, and save it inside the query
 * as a property, then use it in post middleware
 * 工地英语-_-||
 */
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.tourIdToUpdated = (await this.findOne()).tour;
//   next();
// });
reviewSchema.post(/^findOneAnd/, async function (review) {
  if (!review) return;
  await Review.calcAverageRatings(review.tour);
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;