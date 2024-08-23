const express = require('express');

const router = express.Router();

const getRoot = (req, res) => {
  res.status(200).json({ message: 'Hello from server side!', app: "Natours" });
};
const postRoot = (req, res) => {
  res.status(200).send('You can post to this endpoint...');
};

router
  .route('/')
  .get(getRoot)
  .post(postRoot);

module.exports = router;