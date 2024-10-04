const express = require('express');
const adminController = require('../controllers/adminControllers');
const { checkPayment,checkAccess,authenticateExamAccess } = require("../middlewares/updateUser");
const app = express();
const router = express.Router();
const { checkAuthenticated, checkLoggedIn } = require('../config/auth');

router.get('/dashboard', adminController.dashboard);


router.get('/payment-history',adminController.getPaymentHistory);
router.post('/payment-history',adminController.postPaymentAccessUpdate);



router.post('/quiz/:id/clone',adminController.postCloneExam);

router.get('/auth-quiz/:id',checkAuthenticated,adminController.examValidation);


module.exports = router;
