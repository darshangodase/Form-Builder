import mongoose from 'mongoose';

const formSchema = new mongoose.Schema({
  formId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  fields: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['text', 'textarea', 'dropdown', 'checkbox', 'date', 'email', 'phone', 'number']
    },
    label: {
      type: String,
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String
    },
    options: {
      type: [String],
      default: undefined
    },
    checkboxOptions: {
      type: [String],
      default: undefined
    }
  }],
  settings: {
    submitButtonText: {
      type: String,
      default: 'Submit'
    },
    successMessage: {
      type: String,
      default: 'Thank you for your submission!'
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
formSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Form = mongoose.model('Form', formSchema);
export default Form; 