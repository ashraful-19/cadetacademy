const express = require('express');
const issbController = require('../controllers/issbControllers');
const app = express();
const router = express.Router();
const { checkAuthenticated, checkLoggedIn } = require('../config/auth');
const { checkPayment,checkAccess,authenticateExamAccess,authenticatePracticeAccess } = require("../middlewares/updateUser");
router.get('/qna', issbController.getIssbQna);
router.get('/practice', issbController.getPractice);
router.get('/card_content/details', issbController.getCardContentDetails);
router.get('/iqlist', issbController.getIqList);

router.get('/practice-test', issbController.getIncomSen);
router.get('/practice_list', issbController.getIncomSenList);
router.get('/qna', issbController.getIssbQna);
router.get('/blog', issbController.getIssbBlog);
module.exports = router;
