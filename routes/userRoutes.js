const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router
  .post('/signup', authController.signup)
  .post('/login', authController.login);



router
  .route('/')
  .get(userController.getAllUsers)
  .post();

router
  .route('/:id')
  .get()
  .post()
  .delete();


module.exports = router;