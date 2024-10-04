const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const { User, Otp } = require('../models/userModel');

// Assuming you've already initialized connect-flash in your app

passport.use(
  new LocalStrategy({ usernameField: 'phone', passwordField: 'otp' }, async (phone, otp, done) => {
    const otpData = await Otp.findOne({ phone: phone }).sort({ "expires": 1 });

    if (!otpData) {
      const message = 'নতুন করে OTP পাঠান';
      flash('error', message);
      return done(null, false, { message });
    }

    if (otpData.otp !== otp) {
      const message = 'আপনার OTP টি সঠিক নয়!';
      flash('error', message);
      return done(null, false, { message });
    }

    User.findOne({ phone: phone }, (err, user) => {
      if (err) {
        console.error(err);
        return done(err);
      }

      if (!user) {
        const newUser = new User({ phone: phone });
        newUser.save((err, savedUser) => {
          if (err) {
            console.error(err);
            return done(err);
          }

          const successMessage = 'User created successfully!';
          flash('success', successMessage);
          return done(null, savedUser, { message: successMessage });
        });
      } else {
        const successMessage = 'User authenticated successfully!';
        flash('success', successMessage);
        return done(null, user, { message: successMessage });
      }
    });
  })
);



    // passport.use(new GoogleStrategy({
    //   clientID: "69029879313-3fqsa0mb61nv1n93k41cr89h0mko7fkp.apps.googleusercontent.com", // Your Credentials here.
    //   clientSecret: "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", // Your Credentials here.
    //   callbackURL: "http://localhost:3000/auth/google/callback",
  
    // },
    // function(accessToken, refreshToken, profile, done) {
    //   console.log('hello world')
    //   console.log('hello world')
    //   User.findOne({ googleId: profile.id }, (err, user) => {
    //     if (err) return done(err, null);
    //     if (!user) {
    //       let newUser = new User({
    //         googleId: profile.id,
    //         name: profile.displayName,
    //         phone: " ",
    //       });
    //       newUser.save();
    //       return done(null, newUser);
    //     } else {
    //       // if we find an user just return return user
    //       return done(null, user);
    //     }
    //   })

    // }));


    passport.serializeUser((user, done) => {
      done(null, { id: user.id, phone: user.phone }); // Serialize user id and phone number
    });
    
    passport.deserializeUser((serializedUser, done) => {
      User.findById(serializedUser.id, (err, user) => {
        done(err, user);
      });
    });
    