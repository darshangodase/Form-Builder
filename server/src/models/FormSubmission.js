import mongoose from 'mongoose';

const formSubmissionSchema = new mongoose.Schema({
  formId: {
    type: String,
    required: true,
    index: true // Add index for faster queries
  },
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
formSubmissionSchema.index({ formId: 1, submittedAt: -1 });

const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema);
export default FormSubmission; 