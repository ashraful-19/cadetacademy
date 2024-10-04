const express = require('express');
const adminController = require('../controllers/examControllers');
const app = express();
const router = express.Router();
const { checkAuthenticated, checkLoggedIn } = require('../config/auth');
const { uploadCsvMiddleware } = require('../middlewares/multer');

router.post('/create/:id/settings', adminController.updateSettings);
router.get('/create/:id/settings', adminController.examSettings);

router.get('/create/settings/group', adminController.examGroupSettings);

router.post('/create/settings/group', adminController.examGroupSettingsUpdate);
router.get('/create/:id/delete', adminController.deleteIq);
// vebral routes
router.get('/create/quiz', adminController.getExamList);
router.post('/create/quiz', adminController.createExam);

router.get('/create/quiz/:id/edit', adminController.getEditQuestions);
// router.post('/create/quiz/:id/edit', adminController.saveQuestion);
router.get('/create/quiz/:id/question', adminController.deleteQuestion);
router.post('/create/quiz/:id/update', adminController.saveOrUpdateQuestion);

router.post('/create/quiz/:id/sort',adminController.orderQuestions);
router.post('/update-json-question', adminController.postUpdateJsonQuestion);

router.get('/create/quiz/:id/results', adminController.getResults);







module.exports = router;