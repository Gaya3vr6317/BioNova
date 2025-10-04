const express = require('express');
const router = express.Router();

// Contact form submission
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Simulate email sending
        console.log('📧 New contact form submission:');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Subject:', subject);
        console.log('Message:', message);
        console.log('Timestamp:', new Date().toISOString());

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        res.json({ 
            success: true, 
            message: 'Message received successfully! We will get back to you soon.',
            submissionId: Date.now()
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;