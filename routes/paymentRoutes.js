
const express = require ("express");
const paymentController = require('../controllers/paymentControllers');
const app = express();
const router = express.Router();
const { checkAuthenticated, checkLoggedIn } = require('../config/auth');
const { checkPurchasedCourse} = require("../middlewares/updateUser");

router.get('/bkash-callback',checkAuthenticated,checkPurchasedCourse, paymentController.postPayment);
router.get('/bkash-payment',checkAuthenticated,checkPurchasedCourse, paymentController.getPayment);




module.exports = router;
