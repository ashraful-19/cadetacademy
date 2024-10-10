const express = require ("express");
const {User} = require("../models/userModel");
const { ExamSetting,Question,Doubt,UserResult } = require('../models/examModel');
const {Course} = require('../models/courseModel');
const {Payment} = require("../models/paymentModel");
const getIndex = async (req, res) => {
  try {
    res.render('issb/index.ejs');
    } 
    catch (error) {
   console.log(error.message);
  }};




  
  const getDoubts = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // current page, default to 1
      const perPage = 50; // number of doubts per page
  
      const data = await Doubt.findOne({ user: req.user }).populate({
        path: "question_ids",
        options: { sort: { createdAt: -1 } },
      });
  
      if (!data || !data.question_ids) {
        // Handle the case where no doubts are found
        res.render('issb/doubts', {
          data: [],
          currentPage: 1,
          totalPages: 1,
          currentSerial: 1,
        });
        return;
      }
  
      const count = data.question_ids.length; // Count total doubts
  
      const totalPages = Math.ceil(count / perPage); // Calculate total pages

      const currentSerial = (page - 1) * perPage + 1 || 0;
  
      // Slice the doubts to get the ones for the current page
      const doubtsOnPage = data.question_ids.slice((page - 1) * perPage, page * perPage);
  
      res.render('issb/doubts', {
        data: doubtsOnPage,
        currentPage: page,
        totalPages: totalPages,
        currentSerial,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  };
  

  const getCourses = async (req, res) => {
  try {
    const course = await Course.find({is_active: true}).sort({ course_id: -1 }).exec();
      console.log(course)

    res.render('issb/course-list.ejs',{course});
    } 
    catch (error) {
   console.log(error.message);
  }};

  const getCourseDetails = async (req, res) => {
    try {
      const courseId = req.params.id;
      const course = await Course.findOne({course_id: courseId}).sort({ course_id: -1 }).exec();
      console.log(course)
      
  
      res.render('issb/course-details',{course});
      } 
      catch (error) {
     console.log(error.message);
    }};

    const getLessonVideo = async (req, res) => {
      try {
        const type = req.query.type;
        const courseId = 1;
            const course = await Course.findOne({ course_id: courseId }).sort({ course_id: -1 }).exec();
            console.log(course);
            console.log(course.course_syllabus);
        
            // Filter out items with non-numeric order values and non-empty course_content_type
            const validSyllabus = course.course_syllabus.filter(item => !isNaN(item.order) && item.course_content_type.trim() !== '');
        
            // Sort the syllabus based on the numeric order
            const sortedSyllabus = validSyllabus.sort((a, b) => a.order - b.order);
        
            // Extract course_content_type from the sorted syllabus
            const courseTypes = sortedSyllabus.map(item => item.course_content_type);
        const courseGroup = course.course_fb_group;
            console.log('Content Types:', courseTypes);
            res.render('issb/lessonvideo', { course, courseTypes, type, courseGroup  });
        } 
        catch (error) {
       console.log(error.message);
      }};
    



    const getCourseLecture = async (req, res) => {
      try {
        const courseId = req.params.id;
        const course = await Course.findOne({ course_id: courseId }).sort({ course_id: -1 }).exec();
        console.log(course);
        console.log(course.course_syllabus);
    
        // Filter out items with non-numeric order values and non-empty course_content_type
        const validSyllabus = course.course_syllabus.filter(item => !isNaN(item.order) && item.course_content_type.trim() !== '');
    
        // Sort the syllabus based on the numeric order
        const sortedSyllabus = validSyllabus.sort((a, b) => a.order - b.order);
    
        // Extract course_content_type from the sorted syllabus
        const courseTypes = sortedSyllabus.map(item => item.course_content_type);
    const courseGroup = course.course_fb_group;
        console.log('Content Types:', courseTypes);
        res.render('issb/course-lecture', { course, courseTypes, courseGroup  });
   
      } catch (error) {
        console.log(error.message);
      }
    };
    
    
    const getDashboard = async (req, res) => {
      try {
        const user = await User.findOne({ phone: req.user.phone });
        const userId = req.user._id;
        
        // Fetch payments with courses, and filter by validityDate > current date
        const payments = await Payment.find({ user: userId, is_active: true, validityDate: { $gt: new Date() } })
          .populate({
            path: 'course',
            select: 'course_id course_name thumbnail'
          });
    
        console.log(payments);
        res.render('issb/dashboard', { user, payments });
      } catch (error) {
        console.log(error.message);
        // Handle the error appropriately, perhaps by sending an error response to the client
        res.status(500).send('Internal Server Error');
      }
    };
    

  const getProfile = async (req, res) => {
    try {
      const user = await User.findOne({ phone: req.user.phone });
      
   
      res.render('issb/edit-profile',{user: user});
      } 
      catch (error) {
     console.log(error.message);
    }};


    const getTermsAndConditions = async (req, res) => {
      try {
        res.render('issb/terms&conditions');
        } 
        catch (error) {
       console.log(error.message);
      }};
    const getPrivacyAndPolicy = async (req, res) => {
      try {
        res.render('issb/privacy&policy');
        } 
        catch (error) {
       console.log(error.message);
      }};
      
      

      

      const getExam = async (req, res) => {
        try {
          const examCode = req.params.id;
          const userId = req.user._id;
          console.log(examCode);
          const data = await ExamSetting.findOne({ exam_code: examCode }).populate({
            path: "questions",
            options: { sort: { order: -1 } },
          });
          let content = data.questions;
          
          const userDoubts = await Doubt.findOne({ user: userId });
          const newContent = content.map((item) => {
            const hasDoubt = userDoubts?.question_ids.some((doubt) => doubt.equals(item._id));
            return { ...item._doc, doubt: hasDoubt ? 1 : 0 };
          });
          
          console.log(newContent);



      
          // Render the page inside the aggregate callback
          res.render("issb/quiz-exam", { content: newContent, data });
        } catch (error) {
          console.log(error.message);
        }
      };

      const getPractice = async (req, res) => {
        try {
          const examCode = req.params.id;
          const userId = req.user._id;
          console.log(examCode);
          const data = await ExamSetting.findOne({ exam_code: examCode }).populate({
            path: "questions",
            options: { sort: { order: -1 } },
          });
          let content = data.questions;
          
          const userDoubts = await Doubt.findOne({ user: userId });
          if(userDoubts){
          var newContent = content.map((item) => {
            const hasDoubt = userDoubts.question_ids.some(
              (doubt) => doubt.equals(item._id)
            );
            return { ...item._doc, doubt: hasDoubt ? 1 : 0 };
          });
        }else{
            newContent = content;
        }
          console.log(newContent);
      
          // Render the page inside the aggregate callback
          res.render("issb/quiz-practice", { content: newContent, data });
        } catch (error) {
          console.log(error.message);
        }
      };


      

      const getExamImage = async (req, res) => {
        try {
          const examCode = req.params.id;
          const userId = req.user._id;
          console.log(examCode);
          const data = await ExamSetting.findOne({ exam_code: examCode }).populate({
            path: "questions",
            options: { sort: { order: -1 } },
          });
          let content = data.questions;
          
          const userDoubts = await Doubt.findOne({ user: userId });
          const newContent = content.map((item) => {
            const hasDoubt = userDoubts?.question_ids.some((doubt) => doubt.equals(item._id));
            return { ...item._doc, doubt: hasDoubt ? 1 : 0 };
          });
          
          console.log(newContent);



      
          // Render the page inside the aggregate callback
          res.render("issb/quiz-exam-image", { content: newContent, data });
        } catch (error) {
          console.log(error.message);
        }
      };

      const getPracticeImage = async (req, res) => {
        try {
          const examCode = req.params.id;
          const userId = req.user._id;
          console.log(examCode);
          const data = await ExamSetting.findOne({ exam_code: examCode }).populate({
            path: "questions",
            options: { sort: { order: -1 } },
          });
          let content = data.questions;
          
          const userDoubts = await Doubt.findOne({ user: userId });
          if(userDoubts){
          var newContent = content.map((item) => {
            const hasDoubt = userDoubts.question_ids.some(
              (doubt) => doubt.equals(item._id)
            );
            return { ...item._doc, doubt: hasDoubt ? 1 : 0 };
          });
        }else{
            newContent = content;
        }
          console.log(newContent);
      
          // Render the page inside the aggregate callback
          res.render("issb/quiz-practice-image", { content: newContent, data });
        } catch (error) {
          console.log(error.message);
        }
      };



      const postExamResult = async (req, res) => {
        try {
            const examId = req.params.id;
            const userId = req.user._id;
            const answers = req.body;
            const timeTaken = req.body["started-time"];
    
            const content = await ExamSetting.findOne({ exam_code: examId })
            .populate({
                path: "questions",
                match: { field_type: 'choice' },
                options: { sort: { order: -1 } },
            })
            .select("questions negative_marking")
            .lean();
        
    
            const userDoubts = await Doubt.findOne({ user: userId });
    
            // Combine question data with doubt information
            const mappedContent = content.questions.map((item) => {
                const hasDoubt = userDoubts ? userDoubts.question_ids.some((doubt) => doubt.equals(item._id)) : false;
                return { ...item, doubt: hasDoubt ? 1 : 0, your_answer: null };
            });
    
            // Fetch all answers in one query
            const answerIds = mappedContent.map((q) => q._id);
            const allAnswers = await Question.find({ _id: { $in: answerIds } }, "answer").lean();
    
            const result = {};
            const userResponses = [];
    
            // Use Promise.all to parallelize asynchronous operations
            await Promise.all(mappedContent.map(async (mappedQuestion) => {
                const dbAnswer = allAnswers.find((answer) => answer._id.toString() === mappedQuestion._id.toString());
                const userAnswer = answers[mappedQuestion._id];
                const questionId = mappedQuestion._id;
    
                if (userAnswer === "0") {
                    result[questionId] = "skip";
                    mappedQuestion.your_answer = "0";
                    userResponses.push({ questionId, userAnswer: -1 });
                } else {
                    if (dbAnswer) {
                        const isRight = dbAnswer.answer === userAnswer;
                        result[questionId] = isRight ? "right" : "wrong";
                        mappedQuestion.your_answer = userAnswer;
                        userResponses.push({ questionId, userAnswer: isRight ? 1 : 0 });
                    } else {
                        result[questionId] = "wrong";
                    }
                }
            }));
    
            const { right, wrong, skipped } = Object.values(result).reduce((acc, value) => {
              if (value === 'right') {
                  acc.right++;
              } else if (value === 'wrong') {
                  acc.wrong++;
              } else if (value === 'skip') {  // Check for 'skip' value
                  acc.skipped++;
              }
              return acc;
          }, { right: 0, wrong: 0, skipped: 0 });
          
    
            const totalMCQ = right + wrong + skipped;
    console.log(content.negative_marking)
            // Calculate negative marking
            const negativeMarkingPercent = content.negative_marking ? 25 : 0;
            const negativeMarks = wrong * (negativeMarkingPercent / 100);
            const totalMarks = right - negativeMarks;
    
            const finalResult = {
                user_id: userId,
                name: req.user.name,
                institution: req.user.institution,
                right,
                wrong,
                totalMCQ,
                skipped,
                negativeMarks,
                totalMarks,
                timeTaken,
            };
    console.log(finalResult)
            // Save the final result only if it doesn't exist for the user
            let examData = await ExamSetting.findOneAndUpdate(
                { exam_code: examId, 'user_result.user_id': { $ne: userId } },
                { $push: { user_result: finalResult } },
                { new: true }
            );
    
            // If the user_result was not updated (user already exists), retrieve the updated examData
            if (!examData) {
                examData = await ExamSetting.findOne({ exam_code: examId }).lean();
                // Use examData for rendering or further processing
            }

            res.render("issb/quiz-result", { content: mappedContent, result, timeTaken, finalResult, examData });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Error saving doubt");
        }
    };

    
    const postExamResultImage = async (req, res) => {
      try {
          const examId = req.params.id;
          const userId = req.user._id;
          const answers = req.body;
          const timeTaken = req.body["started-time"];
  
          const content = await ExamSetting.findOne({ exam_code: examId })
          .populate({
              path: "questions",
              match: { field_type: 'choice' },
              options: { sort: { order: -1 } },
          })
          .select("questions negative_marking")
          .lean();
      
  
          const userDoubts = await Doubt.findOne({ user: userId });
  
          // Combine question data with doubt information
          const mappedContent = content.questions.map((item) => {
              const hasDoubt = userDoubts ? userDoubts.question_ids.some((doubt) => doubt.equals(item._id)) : false;
              return { ...item, doubt: hasDoubt ? 1 : 0, your_answer: null };
          });
  
          // Fetch all answers in one query
          const answerIds = mappedContent.map((q) => q._id);
          const allAnswers = await Question.find({ _id: { $in: answerIds } }, "answer").lean();
  
          const result = {};
          const userResponses = [];
  
          // Use Promise.all to parallelize asynchronous operations
          await Promise.all(mappedContent.map(async (mappedQuestion) => {
              const dbAnswer = allAnswers.find((answer) => answer._id.toString() === mappedQuestion._id.toString());
              const userAnswer = answers[mappedQuestion._id];
              const questionId = mappedQuestion._id;
  
              if (userAnswer === "0") {
                  result[questionId] = "skip";
                  mappedQuestion.your_answer = "0";
                  userResponses.push({ questionId, userAnswer: -1 });
              } else {
                  if (dbAnswer) {
                      const isRight = dbAnswer.answer === userAnswer;
                      result[questionId] = isRight ? "right" : "wrong";
                      mappedQuestion.your_answer = userAnswer;
                      userResponses.push({ questionId, userAnswer: isRight ? 1 : 0 });
                  } else {
                      result[questionId] = "wrong";
                  }
              }
          }));
  
          const { right, wrong, skipped } = Object.values(result).reduce((acc, value) => {
            if (value === 'right') {
                acc.right++;
            } else if (value === 'wrong') {
                acc.wrong++;
            } else if (value === 'skip') {  // Check for 'skip' value
                acc.skipped++;
            }
            return acc;
        }, { right: 0, wrong: 0, skipped: 0 });
        
  
          const totalMCQ = right + wrong + skipped;
  console.log(content.negative_marking)
          // Calculate negative marking
          const negativeMarkingPercent = content.negative_marking ? 25 : 0;
          const negativeMarks = wrong * (negativeMarkingPercent / 100);
          const totalMarks = right - negativeMarks;
  
          const finalResult = {
              user_id: userId,
              name: req.user.name,
              institution: req.user.institution,
              right,
              wrong,
              totalMCQ,
              skipped,
              negativeMarks,
              totalMarks,
              timeTaken,
          };
  console.log(finalResult)
          // Save the final result only if it doesn't exist for the user
          let examData = await ExamSetting.findOneAndUpdate(
              { exam_code: examId, 'user_result.user_id': { $ne: userId } },
              { $push: { user_result: finalResult } },
              { new: true }
          );
  
          // If the user_result was not updated (user already exists), retrieve the updated examData
          if (!examData) {
              examData = await ExamSetting.findOne({ exam_code: examId }).lean();
              // Use examData for rendering or further processing
          }

          res.render("issb/quiz-result-image", { content: mappedContent, result, timeTaken, finalResult, examData });
      } catch (error) {
          console.error(error.message);
          res.status(500).send("Error saving doubt");
      }
  };
    
      
  const getContact = async (req, res) => {
    try {
      res.render('issb/contact');
      } 
      catch (error) {
     console.log(error.message);
    }};

    const getAbout = async (req, res) => {
      try {
        res.render('issb/about');
        } 
        catch (error) {
       console.log(error.message);
      }};
    


    const postDoubt = async (req, res) => {
      try {
        const examId = req.params.id;
        const questionId = req.query.id;
        const userId = req.user._id;
    console.log(questionId)
        // Find the relevant question and user
        const question = await Question.findOne({ _id: questionId });
    
        // Find existing doubts for the user
        const existingDoubt = await Doubt.findOne({ user: userId });
    
        console.log(existingDoubt);
    
        if (!existingDoubt) {
          // If the user has no doubts, create a new Doubt document
          const newDoubt = new Doubt({
            user: userId,
            question_ids: [questionId], // Use 'question_ids' instead of 'question_id'
          });
          question.doubts_count += 1;
          await newDoubt.save();
        } else {
          const questionIndex = existingDoubt.question_ids.indexOf(questionId); // Use 'question_ids' here
    
          if (questionIndex > -1) {
            // If the question is already saved, then remove it
            existingDoubt.question_ids.splice(questionIndex, 1); // Use 'question_ids' here
            question.doubts_count -= 1;
          } else {
            // If the question is not saved, then push it
            existingDoubt.question_ids.push(questionId); // Use 'question_ids' here
            question.doubts_count += 1;
          }
          await existingDoubt.save();
        }
    
        await question.save();
    
        // res.redirect(`/exam/${examId}`);
      } catch (error) {
        console.log(error.message);
        res.status(500).send('Error saving doubt');
      }
    };
    

module.exports = {
  getIndex,
  getCourses,
  getDoubts,
  getProfile,
  getDashboard,
  getCourseDetails,
  getLessonVideo,
  getCourseLecture,
  getTermsAndConditions,
  getPrivacyAndPolicy,
  getExam,
  getPractice,
  getExamImage,
  getPracticeImage,
  postExamResult,
  postExamResultImage,
  postDoubt,
  getAbout,
  getContact,
};




