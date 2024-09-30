const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router
  .post('/signup', authController.signup)
  .post('/login', authController.login)
  .post('/forgotPassword', authController.forgotPassword)
  .patch('/resetpassword/:token', authController.resetPassword);

// All the routes below now need to be logged in
router.use(authController.validate);

router
  .patch('/updatePassword', authController.updatePassword)
  .patch('/updateMe', userController.updateMe)
  .delete('/deleteMe', userController.deleteMe)
  .get('/me', userController.getMe, userController.getUser);

// All the routes below should be used by admin
router.use(authController.restrictTo('admin'));

router
  .patch('/updateUser', userController.updateUser)
  .get('/', userController.getAllUsers)
  .delete('/:id', userController.deleteUser);

module.exports = router;