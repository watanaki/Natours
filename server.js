const mongoose = require('mongoose');
require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.log("Uncaught exception");
  console.error(err);
  process.exit(1);
});

const app = require('./app');

const DBUrl = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DBUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then((/* con */) => {
  console.log('DB connections successful!');
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
  console.log(`Now in ${process.env.NODE_ENV} mode`);
});

process.on('unhandledRejection', (err) => {
  if (err.code === 8000) console.error("Failed to connect database");
  listener.close(() => {
    process.exit(1);
  });
});

