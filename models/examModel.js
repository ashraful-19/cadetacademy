const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html'); // You might need to install this package

const examSettingSchema = new mongoose.Schema({
  exam_code: {
    type: Number,
    
  },
  exam_name: {
    type: String,
  },  
  instruction: {
    type: String,
  },
  conclusion_text: {
    type: String,
  },
  custom_message: {
    type: Boolean,
    default: false,
  },
  passing_score1: {
    type: Number,
    default: 80,
  },
  
  passing_score2: {
    type: Number,
    default: 50,
  },
  failing_score: {
    type: Number,
    default: 33,
  },
  message_on_pass1: {
    type: String,
  },
  message_on_pass2: {
    type: String,
  },
  message_on_fail: {
    type: String,
  },
  show_result: {
    type: Boolean,
    default: false,
  },
  show_merit: {
    type: Boolean,
    default: false,
  },
  practice: {
    type: Boolean,
    default: false,
  },
  show_explanation: {
    type: Boolean,
    default: false,
  },
  randomize: {
    type: Boolean,
    default: false,
  },
  negative_marking: {
    type: Boolean,
    default: false,
    },
  attempt: {
    type: Number,
    default: 1,
  },
  active_status: {
    type: String,
    default: "closed",
  },
  is_anyone: {
      type: Boolean,
      default: false,
    },  
  course_added: {
    type: [String], // Assuming an array of course names or IDs
  },
  course_tags: {
    type: [String], // Assuming an array of course tags
  },
  time: {
    type: Number,
    default: 1,
  },
  questions: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question', // Referencing the Question model
    }],
  },
  user_result: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
      },
      name: String,
      institution: String,
      right: Number,
      wrong: Number,
      totalMCQ: Number,
      skipped: Number,
      negativeMarks: Number,
      totalMarks: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});


const QuestionSchema = new mongoose.Schema({
  field_type: {
    type: String,
  },
  exam_code: {
    type: Number,
  },
  exam_type: {
    type: String,
  },
  subject: {
    type: String,
  },
  chapter: {
    type: String,
  },
  topic: {
    type: String,
  },
  year: {
    type: String,
  },
  board: {
    type: String,
  },
  version: { 
    type: String,
  },
  question: {
    type: String,
  },
  option: {
    type: [String], 
  }, 
  answer: {
    type: String,
    default: 1,
  },
  explanation: {
    type: String,
  },
  doubts_count: {
    type: Number,
    default: 0,
  },
  order: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const DoubtSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true, 
  },
  question_ids: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// // Define a function to sanitize HTML content
// const sanitizeHtmlContent = (content) => {
//   return sanitizeHtml(content, {
//     allowedTags: ['span'],
//     allowedAttributes: {
//       'span': ['class'],
//     },
//     exclusiveFilter: (frame) => frame.tag === 'span' && frame.attribs.class === 'mathy',
//   });
// };

// // Define a pre-save hook to sanitize HTML content before saving to MongoDB
// QuestionSchema.pre('save', function (next) {
//   this.question = sanitizeHtmlContent(this.question);
//   this.option = this.option.map((opt) => sanitizeHtmlContent(opt));
//   this.explanation = sanitizeHtmlContent(this.explanation);
//   next();
// });


// Define schema for user exam results
const userResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true, 
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  marks: { type: Number, required: true },
  percentage: { type: Number, required: true },
});









const ExamSetting = mongoose.model('ExamSetting', examSettingSchema);
const Question = mongoose.model('Question', QuestionSchema);
const Doubt = mongoose.model('Doubt', DoubtSchema);
const UserResult = mongoose.model('UserResult', userResultSchema);


module.exports = {
  ExamSetting,
  Question,
  Doubt,
  UserResult
};
