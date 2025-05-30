import express from 'express';
import Form from '../models/Form.js';
import FormSubmission from '../models/FormSubmission.js';

const router = express.Router();

// Create a new form
router.post('/', async (req, res) => {
  try {
    const { title, description, fields, settings, isPublic, formId, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if form with this ID already exists
    const existingForm = await Form.findOne({ formId });
    if (existingForm) {
      return res.status(400).json({ 
        success: false,
        message: 'Form with this ID already exists' 
      });
    }

    // Create new form using the provided formId and userId
    const form = new Form({
      formId,
      userId,
      title,
      description,
      fields,
      settings,
      isPublic: isPublic ?? true
    });

    await form.save();
    res.status(201).json({
      success: true,
      form
    });
  } catch (error) {
    console.error('Form creation error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Get a specific form by ID
router.get('/:formId', async (req, res) => {
  try {
    const form = await Form.findOne({ formId: req.params.formId });
    if (!form) {
      return res.status(404).json({ 
        success: false,
        message: 'Form not found' 
      });
    }
    
    res.json({
      success: true,
      form
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Update a form
router.put('/:formId', async (req, res) => {
  try {
    const form = await Form.findOne({ formId: req.params.formId });
    if (!form) {
      return res.status(404).json({ 
        success: false,
        message: 'Form not found' 
      });
    }
    
    const { title, description, fields, settings, isPublic } = req.body;
    const updates = {
      ...(title && { title }),
      ...(description && { description }),
      ...(fields && { fields }),
      ...(settings && { settings }),
      ...(typeof isPublic === 'boolean' && { isPublic })
    };
    
    const updatedForm = await Form.findOneAndUpdate(
      { formId: req.params.formId },
      { $set: updates },
      { new: true }
    );
    
    res.json({
      success: true,
      form: updatedForm
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Delete a form
router.delete('/:formId', async (req, res) => {
  try {
    const form = await Form.findOne({ formId: req.params.formId });
    if (!form) {
      return res.status(404).json({ 
        success: false,
        message: 'Form not found' 
      });
    }
    
    // Delete form and its submissions using formId
    await Promise.all([
      Form.deleteOne({ formId: req.params.formId }),
      FormSubmission.deleteMany({ formId: req.params.formId })
    ]);
    
    res.json({ 
      success: true,
      message: 'Form and its submissions deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Submit a form response
router.post('/:formId/submit', async (req, res) => {
  try {
    const { formId } = req.params;
    const formData = req.body;

    // Create submission using the formId
    const submission = new FormSubmission({
      formId,
      data: formData,
      submittedAt: new Date()
    });
    
    await submission.save();

    res.status(201).json({ 
      success: true,
      message: 'Form submitted successfully'
    });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred while submitting the form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get form submissions
router.get('/:formId/submissions', async (req, res) => {
  try {
    const submissions = await FormSubmission.find({ formId: req.params.formId })
      .sort({ submittedAt: -1 });
    
    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Get public forms
router.get('/public/forms', async (req, res) => {
  try {
    const forms = await Form.find({ isPublic: true })
      .select('title description createdAt updatedAt formId')
      .sort({ updatedAt: -1 });
    res.json({
      success: true,
      forms
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Get forms by userId
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const forms = await Form.find({ userId })
      .select('formId title description createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      forms
    });
  } catch (error) {
    console.error('Error fetching user forms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forms'
    });
  }
});

export default router; 