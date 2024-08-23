const path = require('path');
const rootPath = path.resolve(__dirname, '../..');
require('dotenv').config({ path: `${rootPath}/.env` });
const Tour = require(rootPath + '/Modules/tourModule');
const mongoose = require('mongoose');
const fs = require('fs');

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

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));
tours.forEach(tour => { delete tour.id; });
// console.log(tours);

//Load data from json file to mongo
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//Delete existing data from Tour collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Successfully delete your data in MongoDB');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const argvs = process.argv[2];
if (argvs == '--import' || argvs == '-i') {
  importData();
} else if (argvs == '--delete' || argvs == '-d') {
  deleteData();
} else if (argvs == undefined) {
  console.log('Option argument required!');
  process.exit();
} else {
  console.log('Invalid argument!');
  process.exit();
}

// console.log(process.argv);