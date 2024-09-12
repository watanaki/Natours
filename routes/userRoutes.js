const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router
  .post('/signup', authController.signup)
  .post('/login', authController.login)
  .post('/forgotPassword', authController.forgotPassword)
  .patch('/resetpassword/:token', authController.resetPassword)
  .patch('/updatePassword', authController.validate, authController.updatePassword)
  .patch('/updateMe', authController.validate, userController.updateMe)
  .delete('/deleteMe', authController.validate, userController.deleteMe);


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