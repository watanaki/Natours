const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const rootRouter = require('./routes/rootRouters');

const app = express();

console.log();

console.log();
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}-${req.ip}`);
  next();
}, express.json());

app.use('/api/v1/tours', tourRouter);
app.use('/', rootRouter);

module.exports = app;