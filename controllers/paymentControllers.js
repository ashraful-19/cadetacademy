const express = require ("express");
const mongoose = require('mongoose');
const axios = require("axios");
const { v4: uuid } = require("uuid");
const {Course} = require('../models/courseModel');
const {User} = require("../models/userModel");
const {Payment} = require("../models/paymentModel");
const { createPayment, executePayment } = require('bkash-payment')
const app = express();

const flash = require('connect-flash');
const { restart } = require("nodemon");

const bkashConfig = {
  base_url : 'https://tokenized.pay.bka.sh/v1.2.0-beta',
  username: '01839886977',
  password: '.&$9Bc{KD-i',
  app_key: 'sEJzTU0Ov1KgoBj8ebUT5lnTtc',
  app_secret: 'J8qfRS7JbtjFXCh6vG7wawLxGVOT9zk9s0RYYpK2ZsR9UfxRMth3'
 }




const getPayment = async (req, res) => {
  try {
    const courseId = req.query.course_id;
    const courseObject = await Course.findOne({ course_id: courseId });
console.log('course feeeeget payment')    
    if (!courseObject) {
      req.flash('error', 'Course not found');
      return res.redirect('/');
    }

    const paymentDetails = {
      amount: courseObject.course_fee,
      callbackURL: 'https://missionacademy.com.bd/bkash-callback',
      orderID: 'Order_' + uuid(),
      reference: courseId,
    };

    const result = await createPayment(bkashConfig, paymentDetails);
    console.log(result)
    res.redirect(result?.bkashURL);
  } catch (e) {
    console.log(e);
  }
};






const postPayment = async (req, res) => {
   
  try {
    const { status, paymentID } = req.query;
    console.log(req.query)
    let result;

    if (status === 'success') {
      result = await executePayment(bkashConfig, paymentID);

      if (result?.transactionStatus === 'Completed') {   

        console.log(result?.transactionStatus)

        // Payment success
        const courseId = result?.payerReference; // Get the courseId from the reference
        const userPhone = req.user.phone;

        const userObject = await User.findOne({ phone: userPhone });
        const courseObject = await Course.findOne({ course_id: courseId });

        const validityDate = new Date(Date.now() + (courseObject.validityDate * 30 * 24 * 60 * 60 * 1000));

        if (userObject && courseObject) {
          const payment = new Payment({
            user: userObject._id,
            course: courseObject._id,
            course_id: courseObject.course_id,
            paymentPhone: result?.payerInfo?.payerPhone || userPhone,
            validityDate: validityDate,
            amount: result?.amount || 0,
            paymentMethod: 'bKash',
            transactionId: paymentID,
            is_active: true,
            is_banned: false,
          });

          await payment.save();
          console.log('payment saved in database');
    req.flash('success', 'Payment has been successful');
    res.redirect('/dashboard'); // Redirect to your desired route
        } else {
          req.flash('error', 'User or course not found please contact admin');
        }
      }else {

        console.log('status er MASG')
        console.log(result.statusMessage) 
        res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Failed</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 50px auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              text-align: center;
              color: #e74c3c;
            }
            p {
              text-align: center;
              margin-bottom: 20px;
            }
            a {
              display: block;
              width: fit-content;
              margin: 0 auto;
              padding: 10px 20px;
              background-color: #3498db;
              color: #fff;
              text-decoration: none;
              border-radius: 5px;
              transition: background-color 0.3s ease;
            }
            a:hover {
              background-color: #2980b9;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Payment Failed</h1>
            <p>Your payment failed. Please try again.</p>
            <a href="/course-details">Retry</a> 
          </div>
        </body>
        </html>
        
      `);

      }
    } else {


      res.status(400).send(`
  
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Failed</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            text-align: center;
            color: #e74c3c;
          }
          p {
            text-align: center;
            margin-bottom: 20px;
          }
          a {
            display: block;
            width: fit-content;
            margin: 0 auto;
            padding: 10px 20px;
            background-color: #3498db;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s ease;
          }
          a:hover {
            background-color: #2980b9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Payment Failed</h1>
          <p>Your payment failed. Please try again.</p>
          <a href="/course">Retry</a> 
        </div>
      </body>
      </html>
  `);
  console.log('your payment faildd OTP 3 bar vul diso')
      console.log(status) //status= failure
    }

  } catch (e) {
    console.log(e);
  }
};




         




// app.get("/bkash-callback", async(req, res) => {
//   try {
//     const { status, paymentID } = req.query
//     let result
//     let response = {
//       statusCode : '4000',
//       statusMessage : 'Payment Failed'
//     }
//     if(status === 'success')  result =  await executePayment(bkashConfig, paymentID)

//     if(result?.transactionStatus === 'Completed'){
//       // payment success 
//       // insert result in your db 
//     }
//     if(result) response = {
//       statusCode : result?.statusCode,
//       statusMessage : result?.statusMessage
//     }
//    res.redirect('your_frontend_route')  // Your frontend route
//   } catch (e) {
//     console.log(e)
//   }
// })

module.exports = {
  postPayment,
  getPayment,
};




