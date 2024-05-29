const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./app');

const DBUrl = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DBUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then((/* con */) => {
  // console.log(con.connections);
  console.log('DB connections successful!');
});

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name."],
    unique: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price."],
  }
});

const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
  name: 'The Park Camper',
  price: 997
});

testTour.save().then(doc => {
  console.log(doc);
}).catch(err => {
  console.log(`ERROR HERE!: ${err}`);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});