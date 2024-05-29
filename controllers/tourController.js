const fs = require('fs');
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

const updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Just a patch request placeholder...'
  })
};

const getAllTours = (req, res) => {
  res.status(200).json({
    status: "succeed",
    results: tours.length,
    tours
  });
};

const createTour = (req, res) => {
  // console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    if (err) {
      console.log(err.message);
      tours.pop();
      res.status(422).send('failed to write to file!');
    } else {
      res.status(201).json({
        status: 'sucess',
        data: {
          tour: newTour
        }
      });
    }
  });
};

const getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find(el => el.id === id);

  res.status(200).json({
    status: "succeed",
    tour
  });
}

const checkId = (req, res, next, val) => {
  console.log(`The tour id is ${val}`);
  //This can implicitly convert a number in string type to number
  if (req.params.id * 1 > tours.length) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invaild ID'
    });
  }
  next();
}

const checkBody = (req, res, next) => {
  if (!(req.body.name && req.body.price)) {
    res.status(400).json({
      status: "fail",
      message: "Missing essential argumetns, bad request."
    });
  } else
    next();
}

module.exports = {
  updateTour,
  getAllTours,
  createTour,
  getTour,
  checkId,
  checkBody,
}