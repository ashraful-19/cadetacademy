const express = require('express');
const authController = require('../controllers/authControllers');
const app = express();
const passport = require('passport');
require('../config/passport');
const router = express.Router();
const { upload } = require("../middlewares/multer");
const { updateUser } = require("../middlewares/updateUser");
const { checkAuthenticated, checkLoggedIn } = require('../config/auth');

router.get('/sendotp', authController.getSendOtp);
router.post('/sendotp', authController.postSendOtp);
router.get('/loginNaow lagtepare', authController.getRegister);
router.get('/login',checkLoggedIn, authController.getLogin);


router.post('/login',
  (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: req.session.returnTo || "/",
      failureRedirect: '/auth/sendotp?phone='+req.body.phone,
      failureFlash: true
    })(req, res, next);
  },
  (req, res) => {
    console.log('Login successful!');
    const returnTo = req.session.returnTo || '/';
    res.redirect(successRedirect);
    
  }
);

router.get('/google' , passport.authenticate('google', { scope:
  [ 'email', 'profile' ]
  }));

  
  router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  (req, res) => {
      // Successful authentication, redirect to homepage.
      res.redirect('/');
  }
  ); 

router.post('/update-profile', authController.postUpdateProfile);
router.post('/update-profilepic',upload.single('avatar'), authController.postUpdateProfilePic);
router.get('/logout',authController.logout);

module.exports = router;
