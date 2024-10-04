const express = require ("express");
const { ExamSetting, Question } = require('../models/examModel');
const {Course} = require('../models/courseModel');
const path = require('path');
const csvParser = require('csv-parser');
const fs = require('fs');


const getExamList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // current page, default to 1
    const perPage = 50; // number of exams per page

    let data = await ExamSetting.find({}, null, { sort: { exam_code: -1 } });
    const count = data.length; // Count total exams

    const totalPages = Math.ceil(count / perPage); // Calculate total pages

    console.log(page, perPage, count, totalPages);

    data = data.map(({ _id, exam_type, exam_code, exam_name, status, add_iq, createdAt, questions }) => ({
      _id,
      exam_type,
      exam_code,
      exam_name,
      add_iq,
      status,
      createdAt,
      questions_length: questions ? questions.length : 0
    }));
    console.log(data);

    const ExamsOnPage = data.slice((page - 1) * perPage, page * perPage);

    res.render('admin/create-quiz-list', { content: ExamsOnPage, currentPage: page,
    totalPages: totalPages, });

  } catch (error) {
    console.log(error.message);
    // Handle the error appropriately, perhaps by sending an error response
    res.status(500).send('Internal Server Error');
  }
};


  const createExam = async (req, res) => {
    try {
      console.log(req.body);
      const lastExam = await ExamSetting.findOne().sort({ exam_code: -1 }).exec();
    
      let lastCreatedExam = 2;


      if (lastExam) {
        // Handle the case where there are no exam records in the database
        lastCreatedExam = lastExam.exam_code + 2;
        
      }else{
        //if there is no exams found
       lastCreatedExam = 2;
      }
    
      
      // Create a new quiz record using the last created exam code
      const examSetting = new ExamSetting({
        exam_code: lastCreatedExam,
        exam_name: req.body.exam_name,
        
      });

      console.log(examSetting)
      // Save the new quiz IQ record to the database
      const savedExam = await examSetting.save();
  
      // Send a success response to the client
      res.redirect(`/admin/exam/create/${lastCreatedExam}/settings`);
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  };
  


  const examSettings = async (req, res) => {
    try {
      const examCode = req.params.id;
      console.log(examCode)
      const examSettings = await ExamSetting.findOne({exam_code:examCode}, { questions: 0, user_result: 0});
      console.log(examSettings);
      const courseList = await Course.find({}, { course_name: 1, course_id: 1 });
      console.log(courseList)
      res.render('admin/quiz_settings', { content: examSettings, courseList })
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  };

  const examGroupSettings = async (req, res) => {
    try {
      const examCodes = req.query.quizid; // Exam codes array e.g., ['128', '126', '124', '122', '120']
      const courseList = await Course.find({}, { course_name: 1, course_id: 1 });
      console.log(courseList)
      // Convert the array of strings to an array of integers
      const examCodeIntegers = examCodes.map(code => parseInt(code, 10));
  console.log(examCodeIntegers)
      // Find exams in ExamSetting where the exam_code is in the array
      const data = await ExamSetting.find({ exam_code: { $in: examCodeIntegers } })
        .select('exam_name exam_code') // Select only exam_name and exam_code fields
        .exec();
  
      console.log(data);
      res.render('admin/quiz-group-settings', { content: data, courseList });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  };
  



  const examGroupSettingsUpdate = async (req, res) => {
    try {
      const {
        instruction,
        conclusion_text,
        time,
        attempt,
        randomize,
        negative_marking,
        custom_message,
        show_result,
        show_merit,
        practice,
        show_explanation,
        active_status,
        course_added,
       
        is_anyone,
        passing_score1,
        passing_score2,
        failing_score,
        message_on_pass1,
        message_on_pass2,
        message_on_fail,
      } = req.body;
  
      console.log(req.body);
  
      const examCodes = req.query.quizid; // Exam codes array e.g., ['128', '126', '124', '122', '120']
  
      // Convert the array of strings to an array of integers
      const examCodeIntegers = examCodes.map(code => parseInt(code, 10));
  
      // Construct the update object with only non-empty values
      const updateObject = {
        ...(instruction && { instruction }),
        ...(conclusion_text && { conclusion_text }),
        ...(time !== undefined && { time }),
        attempt: attempt === 'unlimited' ? null : parseInt(attempt, 10),
        randomize: randomize === 'on',
        negative_marking: negative_marking === 'on',
        custom_message: custom_message === 'on',
        show_result: show_result === 'on',
        show_merit: show_merit === 'on',
        practice: practice === 'on',
        show_explanation: show_explanation === 'on',
        ...(active_status && { active_status }),
        ...(course_added && { course_added }),
        is_anyone: is_anyone === 'on',
        ...(passing_score1 && { passing_score1 }),
        ...(passing_score2 && { passing_score2 }),
        ...(failing_score && { failing_score }),
        ...(message_on_pass1 && { message_on_pass1 }),
        ...(message_on_pass2 && { message_on_pass2 }),
        ...(message_on_fail && { message_on_fail }),
      };
  
      // Update multiple documents using updateMany
      const updateResult = await ExamSetting.updateMany(
        { exam_code: { $in: examCodeIntegers } }, // Find documents with exam codes in the array
        {
          $set: updateObject,
        }
      );
  
      console.log(`Updated exam settings`);
      console.log(updateResult);
      res.redirect(`/admin/exam/create/quiz`);
    } catch (error) {
      console.error('Error updating settings:', error.message);
      res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
  };
  

  const deleteIq = async (req, res) => {
    try {
      const examCode = req.params.id;
      console.log(examCode);
  




      // Find and delete ExamSetting
      const examSettingData = await ExamSetting.findOne({ exam_code: examCode });
  
      if (!examSettingData) {
        return res.status(404).send('Exam not found');
      }
  
      // Delete ExamSetting
      await ExamSetting.deleteOne({ exam_code: examCode });
  
      // Delete questions associated with the exam code from the Question database
      const deleteResult = await Question.deleteMany({ exam_code: examCode });
      


      console.log(deleteResult); // Log the result to check for errors
  
      res.redirect('/admin/exam/create/quiz');
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  };
  
  
  const updateSettings = async (req, res) => {
    try {
      const {
        exam_name,
        instruction,
        conclusion_text,
        time,
        attempt,
        randomize,
        negative_marking,
        custom_message,
        show_result,
        show_merit,
        practice,
        show_explanation,
        active_status,
        course_added,
   
        is_anyone,
        passing_score1,
        passing_score2,
        failing_score,
        message_on_pass1,
        message_on_pass2,
        message_on_fail,
      } = req.body;
  
      const examCode = req.params.id;
  
      const updateExamSetting = await ExamSetting.findOne({ exam_code: examCode });
      if (!updateExamSetting) {
        return res.status(404).json({ success: false, message: 'Exam not found' });
      }
  
      const updateFields = {
        randomize: randomize === 'on',
        negative_marking: negative_marking === 'on',
        custom_message: custom_message === 'on',
        show_result: show_result === 'on',
        show_merit: show_merit === 'on',
        practice: practice === 'on',
        show_explanation: show_explanation === 'on',
        is_anyone: is_anyone === 'on',
      };
  
      for (const [key, value] of Object.entries(updateFields)) {
        if (value !== undefined) {
          updateExamSetting[key] = value;
        } else {
          updateExamSetting[key] = false;
        }
      }
  
      updateExamSetting.exam_name = exam_name;
      updateExamSetting.instruction = instruction;
      updateExamSetting.conclusion_text = conclusion_text;
      updateExamSetting.attempt = attempt === 'unlimited' ? null : parseInt(attempt, 10);
      updateExamSetting.time = !isNaN(parseInt(time)) ? parseInt(time) : 0;
      updateExamSetting.passing_score1 = passing_score1;
      updateExamSetting.passing_score2 = passing_score2;
      updateExamSetting.failing_score = failing_score;
      updateExamSetting.message_on_pass1 = message_on_pass1;
      updateExamSetting.message_on_pass2 = message_on_pass2;
      updateExamSetting.message_on_fail = message_on_fail;
      updateExamSetting.active_status = active_status;
      updateExamSetting.course_added = course_added;
  
      await updateExamSetting.save();
      console.log('Updated settings');
      res.redirect(`/admin/exam/create/${examCode}/settings`);
    } catch (error) {
      console.error('Error updating settings:', error.message);
      res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
  };
  




const getEditQuestions = async (req, res) => {
  try {
    const examCode = req.params.id;
    console.log(examCode);

    const data = await ExamSetting.findOne({ exam_code: examCode })
      .populate({
        path: 'questions',
        options: { sort: { order: -1 } }, // Sort by order in descending order
      })
      .exec(); // Explicitly call .exec() to execute the query

    const content = data.questions;
    // console.log(content);

    res.render('admin/edit-question-panel', { content: content, data: data });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
};


const getResults = async (req, res) => {
  try {
    const examCode = req.params.id;
    console.log(examCode);

    // Find the exam settings based on the exam code and populate the user results
    const examSetting = await ExamSetting.findOne({ exam_code: examCode })
      .populate({
        path: 'user_result',
        options: { sort: { order: -1 } }, // Sort by order in descending order
      })
      .exec(); // Execute the query

    if (!examSetting) {
      return res.status(404).send('Exam setting not found');
    }

    // Now, user results will be available in examSetting.user_result
    const userResults = examSetting.user_result;

    // Render the view with the user results
    res.render('admin/user-results', { userResults, examCode });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
};



const deleteQuestion = async (req, res) => {
  try {
      const examCode = req.params.id;
      const deleteId = req.query.delete;
      const deleteIds = req.query.ids;

      console.log(examCode, deleteId, deleteIds);

      // Assuming Question and ExamSetting models are defined

      if (deleteId) {
          const data = await Question.deleteOne({ exam_code: examCode, _id: deleteId });
          // console.log(data)
      } else if (deleteIds) {
      
          const data = await Question.deleteMany({ exam_code: examCode, _id: { $in: deleteIds } });
          // console.log(data)
      }

      const dataRef = await ExamSetting.findOneAndUpdate(
          { exam_code: examCode },
          { $pull: { questions: deleteId || { $in: deleteIds } } },
          { new: true }
      );
     

      res.status(200).json({ data: "Question deleted successfully", deleteIds });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
  }
};

const saveOrUpdateQuestion = async (req, res) => {
  try {
    const {
      field_type,
      exam_type,
      subject,
      chapter,
      topic,
      board,
      year,
      version,
      question,
      option,
      answer,
      explanation,
      order,
    } = req.body;

    console.log(req.body.option, req.body.answer);

    const examCode = req.params.id;
    const quesId = req.query.id;
    const type = req.query.type;
    console.log(quesId);

    // Find the highest order value for the given exam_code
    const highestOrder = await Question.findOne({ exam_code: examCode })
      .sort({ order: -1 })
      .select('order');

    const newOrder = highestOrder ? highestOrder.order + 1 : 1;

    // Create a new question or find the existing question by ID
    const existingQuestion = quesId ? await Question.findById(quesId) : null;

    const updatedQuestion = existingQuestion || new Question();

    // Update the fields of the question
    updatedQuestion.field_type = field_type;
    updatedQuestion.exam_code = examCode;
    updatedQuestion.exam_type = exam_type;
    updatedQuestion.subject = subject;
    updatedQuestion.chapter = chapter;
    updatedQuestion.topic = topic;
    updatedQuestion.board = board;
    updatedQuestion.year = year;
    updatedQuestion.version = version;
    updatedQuestion.question = question;
    updatedQuestion.option = option;
    updatedQuestion.answer = answer;
    updatedQuestion.explanation = explanation;
    updatedQuestion.order = order || (existingQuestion ? existingQuestion.order : newOrder); 

    // Save the question to the database
    await updatedQuestion.save();

    // If it's a new question, update examSetting
    if (!existingQuestion) {
      const examSetting = await ExamSetting.findOne({ exam_code: examCode });
      examSetting.questions.push(updatedQuestion);
      await examSetting.save();
    }

    // Handle different response based on the type parameter
    if (type === 'insert') {
      res.json({ questionId: updatedQuestion._id });
    } else if (type === 'save') {
      // Provide the appropriate link or response based on your use case
    res.redirect(`/admin/exam/create/quiz/${examCode}/edit`);
  }else {
    res.json({response: 'updated'})
  }

  } catch (error) {
    console.error(error);
    res.status(500).send('Error Saving Question');
  }
};


  
  const orderQuestions = async (req, res) => {
    try {
      // Extract examCode from the URL parameter and ids from the request body
      const examCode = req.params.id;
      const ids = req.body.sortedItems;
      console.log(ids, examCode);
  
      // Fetch questions from the database based on the examCode
      const questions = await Question.find({ exam_code: examCode });
    
      for (let i = 0; i < ids.length; i++) {
        console.log(ids[i]);
        const id = ids[i];
      
        // Find the question in the questions array with matching ID
        const question = questions.find(q => q._id.toString() === id);
      
        if (question) {
          // Update the order property of the question to match the loop index in reverse
          question.order = (ids.length - i);
          // Save the updated question back to the database
          await question.save();
        }
      }
      
      // Respond with success message if everything worked as expected
      res.status(200).json({ success: true, message: "Question list order updated successfully" });
    } catch (error) {
      // If an error occurs, log it and respond with an error message
      console.error(error);
      res.status(500).json({ success: false, message: "Failed to update question list order" });
    }
  };
  const postUpdateJsonQuestion = async (req, res) => {
    try {
        const examCode = req.query.exam_code || 8;
        const questions = req.body.reverse(); // Reverse the order of questions
       
        console.log(questions)
        // Find the highest order for the given exam code
        const highestOrder = await Question.findOne({ exam_code: examCode }, { order: 1 })
            .sort({ order: -1 })
            .limit(1);

        // Determine the starting order for the new questions
        const startingOrder = highestOrder ? highestOrder.order + 1 : 1;

        // Add exam_code property to each question object and set the order
        const questionsWithExamCode = questions.map((question, index) => ({
            ...question,
            exam_code: examCode,
            field_type: 'choice',
            order: startingOrder + index,
        }));

        // Insert questions into the Question collection
        const insertedQuestions = await Question.insertMany(questionsWithExamCode, { ordered: false });

        // Update the ExamSetting model
        const examSetting = await ExamSetting.findOne({ exam_code: examCode });

        if (examSetting) {
            examSetting.questions.push(...insertedQuestions.map(question => question._id));
            await examSetting.save();
        }

        // Return the newly added questions' IDs as part of the response
        const questionIds = insertedQuestions.map(question => question._id);
        console.log('Question IDs:', questionIds);

        console.log('Exam Code:', examCode);
        console.log('Redirecting to:', `/admin/exam/create/quiz/${examCode}/edit`);
        res.redirect(`/admin/exam/create/quiz/${examCode}/edit`);
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Unexpected error' });
    }
};


module.exports = {
  examSettings,
  examGroupSettings,
  examGroupSettingsUpdate,
  updateSettings,
  getExamList,  
  createExam,  
  saveOrUpdateQuestion,
  getEditQuestions,
  deleteIq,
  deleteQuestion,
  orderQuestions,
  postUpdateJsonQuestion,
  getResults,
};

