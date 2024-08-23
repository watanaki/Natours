const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const rootRouter = require('./routes/rootRouters');
const globalErrorHandler = require('./controllers/errorController');
const appError = require('./Utils/appError');

const app = express();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}-${req.ip}`);
  next();
}, express.json());

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/', rootRouter);

app.all('*', (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;