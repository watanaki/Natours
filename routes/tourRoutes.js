const express = require('express');
const router = express.Router();
const reviewRouter = require('./reviewRouter');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

// Nested routes
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.getTopFive, tourController.getAllTours);

router
  .route('/tour-stats')
  .get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.validate,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.validate, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.validate, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour)
  .delete(
    authController.validate,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );


module.exports = router;