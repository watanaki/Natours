const express = require('express');
const rateLimit = require("express-rate-limit");
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const rootRouter = require('./routes/rootRouters');
const globalErrorHandler = require('./controllers/errorController');
const appError = require('./Utils/appError');

const app = express();

// Set security HTTP headers
app.use(helmet());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}-${req.ip}`);
  next();
});

// Reading data from request body to req.body
app.use(express.json());

// Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Sanitization against XSS
app.use(xssClean());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsAverage',
    'ratingsQuantity',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: '<h1 style="text-align: center;">Too many request for this IP, try again in an hour.</h1>'
});

// Limit request from same IP
app.use('/api', limiter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/', rootRouter);

app.all('*', (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;