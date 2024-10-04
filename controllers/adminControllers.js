const express = require ("express");
const {Payment} = require("../models/paymentModel");
const {Course} = require("../models/courseModel");
const { ExamSetting,Question } = require('../models/examModel');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const dashboard = async (req, res) => {
  try {
    res.render('admin/dashboard');
    } 
    catch (error) {
   console.log(error.message);
  }};

const getPaymentHistory = async (req, res) => {
  try {

    const payments = await Payment.find()
    .populate({
      path: 'user',
      select: 'phone name'
    })
    .populate({
      path: 'course',
      select: 'course_id course_name'
    });
  console.log(payments);
  
  
    res.render('admin/payment-history', { payments })


  } catch (error) {
    console.error(error);
  }
};

const postPaymentAccessUpdate = async (req, res) => {
  try {
    const userId = req.body.userId;
    const courseId = req.body.courseId;
    const isActive = req.body.isActive;

    // Find the payment in the database
    const payment = await Payment.findOne({ user: userId, course: courseId });

    if (!payment) {
      return res.status(404).send('Payment not found');
    }

    if (isActive && !payment.validityDate) {
      // Calculate the new validity date as 6 months from today
      const validityDate = new Date();
      validityDate.setMonth(validityDate.getMonth() + 6);

      // Update the payment in the database with new validity date and is_active status
      await Payment.updateOne({ user: userId, course: courseId }, { $set: { is_active: isActive, validityDate: validityDate } });
      console.log(`Payment for user ${userId} and course ${courseId} updated:`, { is_active: isActive, validityDate: validityDate });
      
    } else {
      // Only update the is_active status
      await Payment.updateOne({ user: userId, course: courseId }, { $set: { is_active: isActive } });
      console.log(`Payment for user ${userId} and course ${courseId} updated:`, { is_active: isActive });
      console.log(payment);
    }

    res.send('Success');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating payment');
  }
};



const postCloneExam = async (req, res) => {
  try {
    const examId = req.params.id;

    // Step 1: Find the source exam and populate questions
    const sourceExam = await ExamSetting.findOne({ exam_code: examId }).populate('questions');

    if (!sourceExam) {
      console.log(`Source Exam not found for ID: ${examId}`);
      return res.status(404).send('Exam not found');
    }

    // Step 2: Check the last exam and update the latest exam code
    const lastExam = await ExamSetting.findOne().sort({ exam_code: -1 }).exec();
    let lastCreatedExam = 2;

    if (lastExam) {
      lastCreatedExam = lastExam.exam_code + 2;
    }

    // Step 3: Clone the entire sourceExam document
    const clonedExam = new ExamSetting({
      ...sourceExam.toObject(), // Clone the document fields
      _id: undefined, // Exclude the ObjectId
      exam_code: lastCreatedExam, // Assign the new exam code
      exam_name: `${sourceExam.exam_name} (Clone)`, // Modify as needed
      user_result: [],
    });

    // Step 4: Save the cloned exam to the database
    const savedExam = await clonedExam.save();
// Step 5: Clone questions and assign new ObjectId values
const clonedQuestions = sourceExam.questions.map((question) => {
  // Check if question is a Mongoose document
  const { _id, ...clonedQuestion } = question.toObject ? { ...question.toObject() } : { ...question };

  // Generate a new ObjectId for each question
  clonedQuestion._id = new ObjectId();
  clonedQuestion.exam_code = lastCreatedExam;
  return clonedQuestion;
});
console.log(clonedQuestions)
    // Step 6: Save cloned questions to the Question collection
    await Question.insertMany(clonedQuestions);

    // Step 7: Update the cloned exam with the new question ObjectId values
    savedExam.questions = clonedQuestions.map((question) => question._id);

    // Step 8: Save the updated exam with new questions to the ExamSetting collection
    await savedExam.save();

    console.log('Updated Exam with Cloned Questions:', savedExam);

    // Step 9: Respond with success message
    res.render('admin/clone-exam-link', { lastCreatedExam});
  } catch (error) {
    console.error(error);
    res.status(500).send('Error cloning exam');
  }
};


const examValidation = async (req, res) => {
  try {
    const examCode = req.params.id;
    const userPhoneNumber = req.user.phone;
    let availableExams = null;
    // Step 01: Check Exam Link Status
    const examDetails = await ExamSetting.findOne({ exam_code: examCode });
    const userPurchasedCourses = await Payment.find({ user: req.user._id });
    const purchasedCourseIds = userPurchasedCourses.map(course => course.course_id);
    const isCoursePurchased = purchasedCourseIds.some(courseId => examDetails.course_added.includes(courseId));



    if (!examDetails || examDetails.active_status === 'closed') {
      // Exam link is closed or not found
      console.log('Step 01: Exam link is closed or not found.');
      return res.render('admin/quiz-validation', { examDetails,isCoursePurchased, availableExams });
    }

    // Step 02: Check Free Access
    if (examDetails.is_anyone && examDetails.active_status === 'open') {
      // Exam is open
      console.log('Step 02: Exam is open.');
      return res.render('admin/quiz-validation', {examDetails,isCoursePurchased, availableExams });
    }

    // Step 03: Check Purchased Courses
    
    if (isCoursePurchased && examDetails.active_status === 'open') {
      // Exam is open
      console.log('Step 03: Exam is open.');
      return res.render('admin/quiz-validation', { examDetails,isCoursePurchased, availableExams });
    } else {
      // No purchased courses match; suggest available exams
       availableExams = await Course.find({ course_id: { $in: examDetails.course_added } });
console.log(availableExams)
      console.log('Step 03: No purchased courses match.');
      return res.render('admin/quiz-validation', { examDetails,isCoursePurchased, availableExams  });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to perform exam validation' });
  }
};






module.exports = {
 dashboard,
 getPaymentHistory,
 postPaymentAccessUpdate,
 postCloneExam,
 examValidation,
};




