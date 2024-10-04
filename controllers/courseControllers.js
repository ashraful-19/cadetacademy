const express = require ("express");
const mongoose = require('mongoose');
const {Course} = require('../models/courseModel');


const getCourse = async (req, res) => {
  try {
    const course = await Course.find({}, { course_id: 1, course_name: 1, thumbnail: 1 }).sort({ course_id: -1 }).exec();
    res.render('admin/course',{course: course});
    } 
    catch (error) {
   console.log(error.message);
  }};
  const getCreateCourse = async (req, res) => {
    try {
      res.render('admin/create-course');
      } 
      catch (error) {
     console.log(error.message);
    }};
    
    const postCreateCourse = async (req, res) => {
      try {
        const courseId = req.query.course_id;
        console.log(req.body);
    
        if (courseId) {
          // If course id is present in the query parameter, update existing course
          const createCourse = await Course.findOneAndUpdate(
            { course_id: courseId },
            {
              course_name: req.body.course_name,
              thumbnail: req.body.thumbnail,
              course_description: req.body.course_description,
              course_ads: req.body.course_ads,
              course_fee: req.body.course_fee,
              course_discount: req.body.course_discount,
              course_exam: req.body.course_exam,
              course_class: req.body.course_class,
              course_note: req.body.course_note,
              course_fb_group: req.body.course_fb_group,
              validityDate: req.body.validityDate,
              is_update: req.body.is_update,
              is_active: req.body.is_active,
            },
            { new: true } // Return updated document
          );
          console.log('Course updated:', createCourse);
    
          res.redirect(`/admin/course/update/${courseId}`);
        } else {
          // If course id is not present in the query parameter, create a new course
          const lastCourse = await Course.findOne().sort({ course_id: -1 }).exec();
    
          let lastCreatedCourse;
          if (lastCourse) {
            lastCreatedCourse = lastCourse.course_id + 1;
          } else {
            // If there are no existing courses, start from 1
            lastCreatedCourse = 1;
          }
    
          // Create a new Course record using the last created Course code
          const createCourse = new Course({
            course_id: lastCreatedCourse,
            course_name: req.body.course_name,
            thumbnail: req.body.thumbnail,
            course_description: req.body.course_description,
            course_ads: req.body.course_ads,
            course_fee: req.body.course_fee,
            course_discount: req.body.course_discount,
            course_exam: req.body.course_exam,
            course_class: req.body.course_class,
            course_note: req.body.course_note,
            course_fb_group: req.body.course_fb_group,
            validityDate: req.body.validityDate,
            is_update: req.body.is_update,
            is_active: req.body.is_active,
          });
    
          console.log('New course created:', createCourse);
    
          // Save the new Course to the database
          await createCourse.save();
          console.log('im here save er por');
          res.redirect(`/admin/course/update/${createCourse.course_id}`);
        }
      } catch (error) {
        console.log(error.message);
        res.status(500).send(error.message);
      }
    };
    
    
      const getUpdateCourse = async (req, res) => {
        try {
         
          const courseId = req.params.id;
          const course = await Course.findOne({course_id: courseId}).sort({ course_id: -1 }).exec();
         console.log(course)
          res.render('admin/update-course',{courseId,course});
          }
          catch (error) {
         console.log(error.message);
        }};


        const postUpdateCourseSyllabusList = async (req, res) => {
          try {
            const courseId = req.params.id;
            const courseSyllabusIcon = req.body.course_content_icon_url || [];
            const courseSyllabus = req.body.course_content_title || [];
            const courseSyllabusType = req.body.course_content_type || [];
            const courseSyllabusIds = req.body.id || [];
            const course = await Course.findOne({ course_id: courseId });
            const uniqueCategories = new Set();

            for (let i = 0; i < courseSyllabus.length; i++) {
              const courseSyllabusId = courseSyllabusIds[i];
              const newCourseSyllabusData = {
                course_content_type: courseSyllabusType[i],
                course_content_icon_url: courseSyllabusIcon[i],
                course_content_title: courseSyllabus[i],
              };
              uniqueCategories.add(newCourseSyllabusData.course_content_type);


              console.log(newCourseSyllabusData);
        
              console.log(courseSyllabusId);
        
              if (courseSyllabusId) {
                // If courseSyllabusId exists, update the existing record
                await Course.findOneAndUpdate(
                  { 
                    course_id: courseId, 
                    'course_syllabus._id': courseSyllabusId 
                  },
                  { 
                    $set: { 
                      'course_syllabus.$.course_content_type': newCourseSyllabusData.course_content_type,
                      'course_syllabus.$.course_content_icon_url': newCourseSyllabusData.course_content_icon_url,
                      'course_syllabus.$.course_content_title': newCourseSyllabusData.course_content_title 
                    } 
                  },
                  { 
                    new: true 
                  }
                );



                
                console.log(newCourseSyllabusData)
                console.log('updated');
              } else {
                // If courseSyllabusId does not exist, create a new record
                
                course.course_syllabus.push(newCourseSyllabusData);
              }
            }
            const uniqueCategoriesArray = [...uniqueCategories];
             console.log('Unique Categories:', uniqueCategoriesArray);

            await course.save();
            res.redirect(`/admin/course/update-syllabus/${course.course_id}`);
          } catch (error) {
            console.log(error.message);
          }
        };
        

        const deleteCourseSyllabusItem = async (req, res) => {
          try {
            const courseId = req.params.id;
            const syllabusItemId = req.params.syllabus_id;
        
            const course = await Course.findOneAndUpdate(
              { 
                course_id: courseId 
              },
              { 
                $pull: { 
                  course_syllabus: { 
                    _id: syllabusItemId 
                  } 
                } 
              },
              { 
                new: true 
              }
            );
        
            if (course) {
              res.redirect(`/admin/course/update/${courseId}`);
            } else {
              // If the course was not found, return a 404 error
              res.status(404).send('Course not found');
            }
          } catch (error) {
            console.log(error.message);
            res.status(500).send('Error deleting syllabus item');
          }
        };
        

          const getUpdateCourseSyllabus = async (req, res) => {
            try {
              const courseId = req.params.id;
              const course = await Course.findOne({course_id: courseId});
              console.log(course)
              res.render('admin/update-course-syllabus',{courseId,course});
              }
              catch (error) {
             console.log(error.message);
            }};     
                 
          
            const postUpdateCourseSyllabus = async (req, res) => {
              try {
                const courseId = req.params.id;
                const courseSyllabusId = req.body.id;
            
                const course = await Course.findOne({ course_id: courseId });
            
                console.log(courseId, courseSyllabusId);
            
                const { type, link, title } = req.body;
            
                const chapterSyllabus = type.map((typeItem, index) => ({
                  type: typeItem,
                  title: title[index],
                  link: link[index],
                }));
            
                console.log(chapterSyllabus);
            
                const jsonString = JSON.stringify(chapterSyllabus);
            
                if (courseSyllabusId) {
                  // If courseSyllabusId exists, update the existing record
                  await Course.findOneAndUpdate(
                    {
                      course_id: courseId,
                      'course_syllabus._id': courseSyllabusId,
                    },
                    {
                      $set: {
                        'course_syllabus.$.course_content_details': jsonString,
                      },
                    },
                    {
                      new: true,
                    }
                  );
                  console.log('updated');
                } else {
                  // If courseSyllabusId does not exist, create a new record
                  course.course_syllabus.push({ course_content_details: jsonString });
                  console.log('created');
                }
            
                // Move save outside of the if-else block
                await course.save();
            
                res.redirect(`/admin/course/update-syllabus/${courseId}`);
              } catch (error) {
                console.error(error.message);
                res.status(500).send('Server Error');
              }
            };
            
            
            

            const updateCourseSyllabusOrder = async (req, res) => {
              try {
                const courseId = req.params.id;
                const syllabusIds = req.body['id'];
            
                // Fetch the course based on the courseId
                const course = await Course.findOne({ course_id: courseId });
            
                // Update the order of syllabus items based on the provided ids
                for (let i = 0; i < syllabusIds.length; i++) {
                  const id = syllabusIds[i];
                  const syllabus = course.course_syllabus.find(s => s._id.toString() === id);
                  if (syllabus) {
                    syllabus.order = i + 1; // Set the order based on the loop index
                  }
                }
            
                // Save the updated document to the database
                await course.save();
            
                res.status(200).json({ success: true, message: "Course syllabus order updated successfully" });
              } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: "Failed to update course syllabus order" });
              }
            };
            
            
            const deleteCourseSyllabusItemDetails = async (req, res) => {
              try {
                const courseId = req.params.id;
                const courseSyllabusId = req.params.syllabus_id;
                const courseSyllabusDetailsId = req.params.details_id;
                const course = await Course.findOne({ course_id: courseId });
            
                // Find the course syllabus with the specified ID
                const courseSyllabus = course.course_syllabus.find(
                  (syllabus) => syllabus._id.toString() === courseSyllabusId
                );
            
                // Find the index of the course syllabus details item to be deleted
                const courseSyllabusDetailsIndex = courseSyllabus.course_content_details.findIndex(
                  (details) => details._id.toString() === courseSyllabusDetailsId
                );
            
                // Remove the course syllabus details item from the array
                courseSyllabus.course_content_details.splice(courseSyllabusDetailsIndex, 1);
            
                // Save the updated document to the database
                await course.save();
            
                res.redirect(`/admin/course/update-syllabus/${courseId}`);
              } catch (error) {
                console.log(error.message);
              }
            };
            


module.exports = {
  getCourse,
  getCreateCourse,
  postCreateCourse,
  getUpdateCourse,
  updateCourseSyllabusOrder,
  postUpdateCourseSyllabusList,
  getUpdateCourseSyllabus,
  postUpdateCourseSyllabus,
  deleteCourseSyllabusItem,
  deleteCourseSyllabusItemDetails,
};




