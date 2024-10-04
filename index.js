
const express = require ("express");
const app = express();
require('dotenv').config();
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT;
app.set("view engine","ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const db = require('./config/db');   //this is for db connecting not need here just to see in console
const flash = require('connect-flash');
const multer = require('multer');


const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport")




const CourseRoute = require('./routes/courseRoutes');
const adminRoute = require('./routes/adminRoutes');
const authRoute = require('./routes/authRoutes');
const homeRoute = require('./routes/homeRoutes');
const paymentRoute = require('./routes/paymentRoutes');
const homeListRoute = require('./routes/issbRoutes');
const examRoute = require('./routes/examRoutes');




app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.dbURL,
      collectionName: "sessions",
    }),
    // cookie: { secure: true },
  })
);



app.use(flash());


// Add middleware to expose flash messages to views
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success');
  res.locals.error_messages = req.flash('error');
  console.log(res.locals)
  next();
});





app.use(passport.initialize());
app.use(passport.session());



app.use((req,res,next) => {
  if (req.isAuthenticated()) {
    console.log(req.user)
  }
console.log(req.session)

next();
});


app.use(function(req, res, next) {
  res.locals.req = req;
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});





// app.get('/protected-route', (req, res, next) => {
    
//   // This is how you check if a user is authenticated and protect a route.  You could turn this into a custom middleware to make it less redundant
//   if (req.isAuthenticated()) {
//       res.send('<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>');
//   } else {
//       res.send('<h1>You are not authenticated</h1><p><a href="/login">Login</a></p>');
//   }
// });

// // Visiting this route logs the user out
app.use('/auth', authRoute);
app.use('/', homeRoute);
app.use('/',paymentRoute);
app.use('/issb', homeListRoute);
app.use('/admin', adminRoute);
app.use('/admin/course', CourseRoute);
app.use('/admin/exam', examRoute);

// app.get('/login-success', (req, res, next) => {
//   res.send('<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>');
// });

// app.get('/login-failure', (req, res, next) => {
//   res.send('You entered the wrong password.');
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images'); // Replace with your upload directory
  },
  filename: function (req, file, cb) {

    const randomName = `${Date.now()}-qs`;
    const ext = file.originalname.split('.').pop();
    const newFilename = `${randomName}.${ext}`;
    
    cb(null, newFilename);
  },
});

const upload = multer({ storage: storage }).single('image'); // 'image' should match your field name

app.post("/upload", upload, (req, res, next) => {
  const file = req.file;
  console.log('file updlad errorrr vaiya ')
  console.log(file);
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }

  const uploadedFilePath = `/images/${req.file.filename}`;
  console.log(`Uploaded file path: http://localhost:8080${uploadedFilePath}`);
  res.json({ link: uploadedFilePath });
});



// Webhook route for handling GitHub events
app.post('/web-hooks', (req, res) => {
  const event = req.headers['x-github-event'];
  console.log(`Received event: ${event}`);

  if (event === 'push') {
      // Modify the command to stash changes before pulling
      exec('cd /home/missionacademy && git stash && git pull && npm install && pm2 restart missionacademy', (err, stdout, stderr) => {
          if (err) {
              console.error(`Exec error: ${err.message}`);
              return res.status(500).send('Server Error');
          }
          if (stderr) {
              console.error(`Stderr: ${stderr}`);
              return res.status(500).send('Server Error');
          }
          console.log(`Stdout: ${stdout}`);
          res.status(200).send('Update successful');
      });
  } else {
      console.log(`Unsupported event: ${event}`);
      res.status(400).send('Event not supported');
  }
});


app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});