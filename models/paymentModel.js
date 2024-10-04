
const mongoose = require('mongoose');

    const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    paymentPhone: { type: String, required: true },
    course_id: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    validityDate: {
      type: Date,
      required: false,
    },
    usedPromocode: { type: String},
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, required: true },
    is_active: { type: Boolean, required: true ,default: false, },
    is_banned: { type: Boolean ,default: false, },
  });
  
  
  const Payment = mongoose.model('Payment', paymentSchema);
  
  module.exports = {
  Payment,
  };
  