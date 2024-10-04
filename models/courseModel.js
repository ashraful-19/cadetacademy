const mongoose = require('mongoose');
const CourseSchema = new mongoose.Schema({
    course_id: {
      type: Number,
      required: true
    },
    course_name: {
      type: String,
    },
    slug: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    course_ads: {
      type: String,
    },
    course_description: {
      type: String,
    },
    course_fee: {
      type: Number,
      required: true ,
      default: 0,
    },
    course_discount:{
      type: Number,
      default:0,
    },
    course_syllabus: [{
              course_content_type: {
                type: String,
          },
            course_content_icon_url: {
              type: String,
            },
            course_content_title: {
              type: String,
            },
            course_content_details:{
              type: String,
            },
            order: {
              type: Number,
              default: 0,
            }
          }],
    course_class: {
      type: String,
    },
    course_exam: {
       type: String,
    },
    course_note: {
       type: String,
    },
    course_fb_group: {
      type: String,
   }, 
   validityDate: {
    type: Number,
    required: false,
  },      
    is_active: {                // true hole show hobe course page e
      type: Boolean, 
      required: true ,
      default: false, 
    },
    is_update: {                 //user and paid both eki message dekhbe course is being updating. Link pabe na
      type: Boolean,
      required: true ,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  

const Course = mongoose.model('Course', CourseSchema);
  
module.exports = {
  Course,

};



