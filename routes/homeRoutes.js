const express = require('express');
const homeController = require('../controllers/homeControllers');
const app = express();
const router = express.Router();
const { checkAuthenticated, checkLoggedIn } = require('../config/auth');
const { updateUser, checkPayment,checkAccess,authenticateExamAccess,authenticatePracticeAccess,checkCourseAccess,checkPurchasedCourse} = require("../middlewares/updateUser");

router.get('/', homeController.getIndex);
router.get('/doubts',checkAuthenticated, homeController.getDoubts);
router.get('/course', homeController.getCourses);
router.get('/profile',checkAuthenticated, homeController.getProfile);
router.get('/course-details/:id', homeController.getCourseDetails);
router.get('/dashboard',checkAuthenticated, homeController.getDashboard);
router.get('/issb/lessonvideo', homeController.getLessonVideo);
router.get('/course-lecture/:id',checkAuthenticated,checkCourseAccess, homeController.getCourseLecture);
router.get('/privacy&policy', homeController.getPrivacyAndPolicy);
router.get('/terms&conditions', homeController.getTermsAndConditions);
router.get('/exam/:id',checkAuthenticated,authenticateExamAccess, homeController.getExam);
router.get('/practice/:id',checkAuthenticated,authenticatePracticeAccess, homeController.getPractice);

router.get('/quiz-exam/:id',checkAuthenticated,authenticateExamAccess, homeController.getExamImage);
router.get('/quiz-practice/:id',checkAuthenticated,authenticatePracticeAccess, homeController.getPracticeImage);
router.post('/result/:id',checkAuthenticated, homeController.postExamResult);

router.post('/quiz-result/:id',checkAuthenticated, homeController.postExamResultImage);
router.get('/doubt/:id',checkAuthenticated, homeController.postDoubt);
router.get('/about', homeController.getAbout);
router.get('/contact',homeController.getContact);

module.exports = router;