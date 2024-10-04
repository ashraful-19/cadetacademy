const express = require('express');
const CourseController = require('../controllers/courseControllers');
const app = express();
const router = express.Router();
const { checkAuthenticated, checkLoggedIn } = require('../config/auth');

router.get('/', CourseController.getCourse);
router.get('/create_course', CourseController.getCreateCourse);
router.post('/create_course', CourseController.postCreateCourse);
router.get('/update/:id', CourseController.getUpdateCourse);
router.post('/update/:id', CourseController.postUpdateCourseSyllabusList);
router.post('/order/:id', CourseController.updateCourseSyllabusOrder);
router.get('/:id/syllabus/:syllabus_id/', CourseController.deleteCourseSyllabusItem);
router.get('/:id/syllabus/:syllabus_id/details/:details_id', CourseController.deleteCourseSyllabusItemDetails);
router.get('/update-syllabus/:id', CourseController.getUpdateCourseSyllabus);
router.post('/update-syllabus/:id', CourseController.postUpdateCourseSyllabus);
module.exports = router;
