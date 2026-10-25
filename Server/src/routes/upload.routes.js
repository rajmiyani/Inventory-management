const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyToken = require('../middleware/auth.middleware');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit (Base64 increases size by ~33%)
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// POST /api/upload/profile-image
// Convert image to Base64 and return data URL
router.post('/profile-image', verifyToken, upload.single('image'), async (req, res) => {
    try {
        console.log('Upload request received');

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        console.log('Processing file - Size:', file.size, 'Type:', file.mimetype);

        // Convert buffer to Base64
        const base64Image = file.buffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64Image}`;

        console.log('Image converted to Base64 successfully');

        res.json({
            message: 'Image processed successfully',
            photoURL: dataUrl
        });

    } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
