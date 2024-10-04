
const {Otp,User} = require("../models/userModel");

const {Payment} = require("../models/paymentModel");
const { ExamSetting,Question } = require('../models/examModel');
// const updateUser = async (req, res) => {
//     try {
//       const phone = req.user.phone;

// // Find the user object by phone number and update the fields
// const result = await User.findOneAndUpdate(
// { phone: phone },
// { $set: {
//   name: req.body.name,
//   institution: req.body.institution,
//   course: req.body.course,
//   email: req.body.email
// }
// },
// { new: true }
// );

// if (result) {
// res.status(200).json({ message: 'User data updated successfully' });
// } else {
// res.status(404).json({ error: 'User not found' });
// }
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }};        


const updateUser = async (req, res, next) => {
  try {
      

  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error22222227' });
  }
};



      const checkPayment = async (req, res, next) => {
        try {
          const userId = req.user._id;
          const courseId = req.params.id;
          console.log(userId, courseId);
      
          const payment = await Payment.findOne({ user: userId, course_id: courseId });
          console.log(payment);
      
          if (!payment || !payment.is_active) {
          
            return next();
          }
      
          
      
          // Payment found and active, allow to next middleware/controller
          res.redirect(`/course-lecture/${courseId}`);
        } catch (error) {
          console.error(error);
          res.status(500).send('Error checking payment');
        }
      };

      const checkAccess = async (req, res, next) => {
        try {
          const userId = req.user._id;
          const courseId = req.params.id;
          console.log(userId, courseId);
      
          const payment = await Payment.findOne({ user: userId, course_id: courseId });
          console.log(payment);
      
          if (payment || payment.is_active) {
          
            return next();
          }
         
      
          // Payment found and active, allow to next middleware/controller
          res.redirect(`/course-details/${courseId}`);
        } catch (error) {
          console.error(error);
          res.status(500).send('Error checking payment');
        }
      };

      const authenticateExamAccess = async (req, res, next) => {
        try {
            const examCode = req.params.id;
            const userPhoneNumber = req.user.phone;
           
            // Step 01: Check Exam Link Status
            const examDetails = await ExamSetting.findOne({ exam_code: examCode });
    
            if (!examDetails || examDetails.active_status === 'closed') {
                // Exam link is closed or not found
                console.log('Step 01: Exam link is closed or not found.');
                return res.redirect(`/admin/auth-quiz/${ examCode }`);
            }
    
            // Step 02: Check Free Access
            if (examDetails.is_anyone && examDetails.active_status === 'open') {
                // Exam is open
                console.log('Step 02: Exam is open.....');
                return next();
            }
    
            // Step 03: Check Purchased Courses
            const userPurchasedCourses = await Payment.find({ user: req.user._id });
            const purchasedCourseIds = userPurchasedCourses.map(course => course.course_id);
    
            if (purchasedCourseIds.length === 0) {
                // No purchased courses; suggest available exams
                const availableExams = await ExamSetting.find({ exam_added: { $in: purchasedCourseIds } });
    
                console.log('Step 03: No purchased courses match.');
                return res.redirect(`/admin/auth-quiz/${ examCode }`);
            }
    
            const isCoursePurchased = purchasedCourseIds.some(courseId => examDetails.course_added.includes(courseId));
    
            if (isCoursePurchased && examDetails.active_status === 'open') {
                // Exam is open
                console.log('Step 03: Exam is open.');
                return next();
            } else {
                // No purchased courses match; suggest available exams
                const availableExams = await ExamSetting.find({ exam_added: { $in: purchasedCourseIds } });
    
                console.log('Step 03: No purchased courses match.');
                return res.redirect(`/admin/auth-quiz/${ examCode }`);
            }
    
        } catch (error) {
            // Handle errors
            console.error("Error in authentication:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    

    const authenticatePracticeAccess = async (req, res, next) => {
      try {
          const examCode = req.params.id;
          const userPhoneNumber = req.user.phone;
         
          // Step 01: Check Exam Link Status
          const examDetails = await ExamSetting.findOne({ exam_code: examCode });
  
          if (!examDetails || examDetails.active_status === 'closed') {
              // Exam link is closed or not found
              console.log('Step 01: Exam link is closed or not found.');
              return res.redirect(`/admin/auth-quiz/${ examCode }`);
          }
  
          // Step 02: Check Free Access
          if (examDetails.is_anyone && examDetails.active_status === 'open' && examDetails.practice ) {
              // Exam is open
              console.log('Step 02: Exam is open for practice.....');
              return next();
          }
  
          // Step 03: Check Purchased Courses
          const userPurchasedCourses = await Payment.find({ user: req.user._id });
          const purchasedCourseIds = userPurchasedCourses.map(course => course.course_id);
  
          if (purchasedCourseIds.length === 0) {
              // No purchased courses; suggest available exams
              const availableExams = await ExamSetting.find({ exam_added: { $in: purchasedCourseIds } });
  
              console.log('Step 03: No purchased courses match.');
              return res.redirect(`/admin/auth-quiz/${ examCode }`);
          }
  
          const isCoursePurchased = purchasedCourseIds.some(courseId => examDetails.course_added.includes(courseId));
  
          if (isCoursePurchased && examDetails.active_status === 'open' && examDetails.practice) {
              // Exam is open
              console.log('Step 03: Exam is open for practice ');
              return next();
          } else {
              // No purchased courses match; suggest available exams
              const availableExams = await ExamSetting.find({ exam_added: { $in: purchasedCourseIds } });
  
              console.log('Step 03: No purchased courses match.');
              return res.redirect(`/admin/auth-quiz/${ examCode }`);
          }
  
      } catch (error) {
          // Handle errors
          console.error("Error in authentication:", error);
          res.status(500).send("Internal Server Error");
      }
  };
  
  
  const checkCourseAccess = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const courseId = req.params.id;
  
      // Fetch payment with the specified user, course, and conditions
      const payment = await Payment.findOne({
        user: userId,
        course_id: courseId,
        is_active: true,
        is_banned: false,
        validityDate: { $gt: new Date() }
      });
      console.log(payment)
      // If payment meets the conditions, proceed to the next middleware or route handler
      if (payment) {
        next();
      } else {
        // If conditions are not met, respond with an error or redirect to an unauthorized page
        res.redirect(`/course-details/${courseId}`)

      }
    } catch (error) {
      console.log(error.message);
      // Handle the error appropriately, perhaps by sending an error response to the client
      res.status(500).send('Internal Server Error');
    }
  };
  



  const checkISSBCourseAccess = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const courseId = req.params.id;
  
      // Fetch payment with the specified user, course, and conditions
      const payment = await Payment.findOne({
        user: userId,
        course_id: courseId,
        is_active: true,
        is_banned: false,
        validityDate: { $gt: new Date() }
      });
      console.log(payment)
      // If payment meets the conditions, proceed to the next middleware or route handler
      if (payment) {
        next();
      } else {
        // If conditions are not met, respond with an error or redirect to an unauthorized page
        res.redirect('/course-details/1')
        res.status(403).send('Access Denied please buy the course');
      }
    } catch (error) {
      console.log(error.message);
      // Handle the error appropriately, perhaps by sending an error response to the client
      res.status(500).send('Internal Server Error Please login');
    }
  };
  



  const checkPurchasedCourse = async (req, res, next) => {
    try {
      // Check if req.user is defined and has the _id property
      const userId = req.user && req.user._id;
      const courseId = req.query.course_id;
  
      console.log('course kinse kina ');
  
      // Check if the course is previously purchased
      const purchasedCourse = await Payment.findOne({
        user: userId,
        course_id: courseId,
        is_active: true,
        is_banned: false,
        validityDate: { $gt: new Date() }
      });
  
      // If the course is previously purchased, redirect to the course-lecture page
      if (purchasedCourse) {
        res.redirect(`/course-lecture/${courseId}`);
      } else {
        // If the course is not purchased, proceed to the next middleware or route
        console.log('course to kininai babaji')
        next();
      }
    } catch (error) {
      console.log(error.message);
      // Handle the error appropriately, perhaps by sending an error response to the client
      res.status(500).send('Internal Server Error');
    }
  };
   
    module.exports={
        updateUser,
        checkPayment,
        checkAccess,
        authenticateExamAccess,
        authenticatePracticeAccess,
        checkCourseAccess,
        checkPurchasedCourse,
        checkISSBCourseAccess,
    }