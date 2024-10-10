const express = require ("express");
const { ExamSetting,Question,Doubt,UserResult } = require('../models/examModel');

const {Payment} = require("../models/paymentModel");
const {User} = require("../models/userModel");
const path = require('path');
const fs = require('fs/promises');  // Use fs.promises for promise-based file operations


const getIssbQna = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // current page, default to 1
    const perPage = 19; // number of users per page
    const type = req.query.type; // ppdt
    const text_type = req.query.text_type; // bangla or english or both

    const query = { exam_type: "ISSB", subject: type, board: 'QNA' };


    const count = await Question.countDocuments(query); // Count total documents
    const totalPages = Math.ceil(count / perPage); // Calculate total pages

    console.log(page, perPage, type, text_type, count, totalPages);

    const data = await Question.find(query)
      .sort({ order: -1 }) // Sort by order
      .skip((page - 1) * perPage) // Skip documents
      .limit(perPage); // Limit number of documents per page

      let isPayment = false;

      if (req.user) { // Check if user is logged in
          const userId = req.user._id;
          const courseId = 1;
      
          // Fetch payment with the specified user, course, and conditions
          const payment = await Payment.findOne({
              user: userId,
              course_id: 1,
              is_active: true,
              is_banned: false,
              validityDate: { $gt: new Date() }
          });
      
          if (payment) {
              isPayment = true; // User has an active payment for the course
          }
      }
console.log(isPayment)
    // Render the page using the dynamically determined link
    res.render('issb/issb-qna', {
      content: data,
      isPayment,
      title: type,
      currentPage: page,
      totalPages: totalPages,
      type: type,
      text_type: text_type || '' // Provide a default value if text_type is undefined
    });
  } catch (error) {
    console.log(error.message);
  }
};


  const getPractice = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // current page, default to 1
      const perPage = 19; // number of users per page
      const type = req.query.type; // ppdt
      const text_type = req.query.text_type; // bangla or english or both
  
      const query = { exam_type: "ISSB", subject: type , board: "Practice" };
  
      // Add the condition for text_type only if it's provided and not an empty string
      if (text_type !== undefined && text_type !== '') {
        query.version = text_type;
      }
  
      const count = await Question.countDocuments(query); // Count total documents
      const totalPages = Math.ceil(count / perPage); // Calculate total pages
  
      console.log(page, perPage, type, text_type, count, totalPages);
      const data = await Question.find(query)
      .select('question option explanation') // Select only 'question' and 'option' fields
      .sort({ order: 1 }) // Sort by order
      .skip((page - 1) * perPage) // Skip documents
      .limit(perPage); // Limit number of documents per page
  
      console.log(data);
  
      let isPayment = false;

if (req.user) { // Check if user is logged in
    const userId = req.user._id;

    // Fetch payment with the specified user, course, and conditions
    const payment = await Payment.findOne({
        user: userId,
        course_id: 1,
        is_active: true,
        is_banned: false,
        validityDate: { $gt: new Date() }
    });

    if (payment) {
        isPayment = true; // User has an active payment for the course
    }
}

      // Dynamically determine the render link based on the 'type' variable
      let renderLink;
      if (type === 'Picture Story' || type === 'PPDT' || type === 'Incomplete Story') {
        renderLink = 'issb/practice';
      } else {
        renderLink = 'issb/card_content';
      }
      // Render the page using the dynamically determined link
      res.render(renderLink, {
        isPayment: isPayment,
        content: data,
        title: type,
        currentPage: page,
        totalPages: totalPages,
        type: type,
        text_type: text_type || '' // Provide a default value if text_type is undefined
      });
    } catch (error) {
      console.log(error.message);
    }
  };
   
    const getCardContentDetails = async (req, res) => {
      try {

        const type = req.query.type;
        
        const text_type = req.query.text_type;
        const id = req.query.id;
    
    
        const data = await Question.findOne({exam_type:"ISSB" , _id:id })
        console.log(data)
        res.render('issb/card_content_details', {
          content: data,
          title: type,
          text_type: text_type,
        });
      } catch (error) {
        console.log(error.message);
      }
    };
    

    const getIncomSen = async (req, res) => {
      try {
        const type = req.query.type;
        const text_type = req.query.text_type;
        const practice_type = req.query.practice_type;
        console.log(type, text_type, practice_type);
    
        let jsonFileName = 'incom_sentences.json'; // Default JSON file name
    
        if (practice_type && practice_type.toUpperCase() === 'WAT') {
          jsonFileName = 'wat.json'; // Change the JSON file for WAT type
        }
    
        const jsonFilePath = path.join(__dirname, '..', 'public', 'assets', jsonFileName);
    
        const jsonData = await fs.readFile(jsonFilePath, 'utf8');
    
        // Parse the JSON data
        let data = JSON.parse(jsonData);
    

        
        if (practice_type === 'Incomplete Sentences') {
          data = data[text_type][type];
          console.log(data)
          res.render('issb/incompleting_sentences', {
            data: data,
            title: type,
          });
        } else if (practice_type === 'WAT') {
          data = data[text_type][type];
          console.log(data)
          res.render('issb/wat_test', {
            data: data,
            title: type,
          });
        } else {
          // Handle other practice types or provide a default behavior
          res.send('Invalid practice type');
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    
    
    const getIncomSenList = async (req, res) => {
      try {
        const type = req.query.type;
        const text_type = req.query.text_type;
        const practice_type = type;
        console.log(type, text_type,practice_type);
    
        let jsonFileName = 'incom_sentences.json'; // Default JSON file name
    
        if (type && type.toUpperCase() === 'WAT') {
          jsonFileName = 'wat.json'; // Change the JSON file for WAT type
        }
    
        const jsonFilePath = path.join(__dirname, '..', 'public', 'assets', jsonFileName);
    
        const jsonData = await fs.readFile(jsonFilePath, 'utf8');
    
        // Parse the JSON data
        const data = JSON.parse(jsonData);
        let isPayment = false;

        if (req.user) { // Check if user is logged in
            const userId = req.user._id;
            const courseId = 1;
        
            // Fetch payment with the specified user, course, and conditions
            const payment = await Payment.findOne({
                user: userId,
                course_id: 1,
                is_active: true,
                is_banned: false,
                validityDate: { $gt: new Date() }
            });
        
            if (payment) {
                isPayment = true; // User has an active payment for the course
            }
        }
console.log(isPayment)
        res.render('issb/wat&incomsenlist', {
          data: data,
          title: type,
          text_type,
          practice_type,
          isPayment,
        });
      } catch (error) {
        console.log(error.message);
      }
    };
    
    const getIqList = async (req, res) => {
      try {
       
       const title = req.query.title;
       let time, examMarks;

if (title === "Verbal Test") {
    time = 60;
    examMarks = 100;
} else if (title === "Non-Verbal Test") {
    time = 12;
    examMarks = 38;
} else {
    // Handle other cases or provide default values
    time = 0;
    examMarks = 0;
}
       
       let jsonFileName = 'iq_test.json'; // Default JSON file name
    
   
       const jsonFilePath = path.join(__dirname, '..', 'public', 'assets', jsonFileName);
   
       const jsonData = await fs.readFile(jsonFilePath, 'utf8');
   
       // Parse the JSON data
       const data = JSON.parse(jsonData)[title];
   

       let isPayment = false;

       if (req.user) { // Check if user is logged in
           const userId = req.user._id;
           const courseId = 1;
       
           // Fetch payment with the specified user, course, and conditions
           const payment = await Payment.findOne({
               user: userId,
               course_id: 1,
               is_active: true,
               is_banned: false,
               validityDate: { $gt: new Date() }
           });
       
           if (payment) {
               isPayment = true; // User has an active payment for the course
           }
       }
console.log(isPayment)

        res.render('issb/iqlist', { content: data,title,time,examMarks,isPayment });
    
       } catch (error) {
       console.log(error.message);
      }};

      
  
             
        
      const getIssbBlog = async (req, res) => {
        try {
          const type = req.query.type;
          const text_type = req.query.text_type;
          let jsonFileName = 'incom_sentences.json'; // Default JSON file name
    
          if (practice_type && practice_type.toUpperCase() === 'WAT') {
            jsonFileName = 'wat.json'; // Change the JSON file for WAT type
          }
      
          const jsonFilePath = path.join(__dirname, '..', 'public', 'assets', jsonFileName);
      
          const jsonData = await fs.readFile(jsonFilePath, 'utf8');
      
          // Parse the JSON data
          let data = JSON.parse(jsonData);
      
         
          res.render('issb/issb-qna', { content: data,title,time,examMarks });

        } catch (error) {
          console.log(error.message);
        }
      };
  
  

module.exports = {
  getIssbQna,
  getPractice,
  getCardContentDetails,
  getIqList,
  getIncomSen,
  getIncomSenList,
  getIssbBlog,
};


