const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check if we have the minimum configuration needed
const hasCloudinaryConfig = process.env.CLOUDINARY_CLOUD_NAME && 
                           process.env.CLOUDINARY_API_KEY && 
                           process.env.CLOUDINARY_API_SECRET;

// Log configuration status
console.log(`Cloudinary configuration status: ${hasCloudinaryConfig ? 'OK' : 'MISSING'}`);
console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME ? '✓' : '✗');
console.log('API key:', process.env.CLOUDINARY_API_KEY ? '✓' : '✗');
console.log('API secret:', process.env.CLOUDINARY_API_SECRET ? '✓' : '✗');

if (!hasCloudinaryConfig) {
  console.warn('Warning: Cloudinary configuration is incomplete or missing. Image uploads may fail.');
}

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private
exports.uploadImage = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
    console.log('Content-Type:', req.headers['content-type']);
    
    if (!req.files) {
      return res.status(400).json({
        success: false,
        error: 'No files were uploaded - req.files is undefined'
      });
    }
    
    // Check if the file is available
    if (!req.files.file) {
      const availableFiles = Object.keys(req.files);
      return res.status(400).json({
        success: false,
        error: `No file with name 'file' was uploaded. Available files: ${availableFiles.join(', ')}`
      });
    }

    // Get the uploaded file
    const file = req.files.file;
    
    // Validate file type (allow images + common documents)
    const validMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!validMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: `Invalid file type: ${file.mimetype}. Allowed: images, pdf, doc, docx.`
      });
    }
    
    console.log('File details:', { 
      name: file.name, 
      size: file.size, 
      mimetype: file.mimetype 
    });
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Create a unique filename
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);
    
    console.log('Moving file to:', filePath);
    
    try {
      // Move the file to the temporary location
      await file.mv(filePath);
    } catch (moveError) {
      console.error('Error moving file:', moveError);
      return res.status(500).json({
        success: false,
        error: `Error saving uploaded file: ${moveError.message}`
      });
    }
    
    console.log('File moved successfully, uploading to Cloudinary');
    
    // Check Cloudinary configuration
    if (!hasCloudinaryConfig) {
      console.error('Cloudinary configuration missing');
      
      // Clean up the temporary file
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error('Error removing temp file:', unlinkError);
        }
      }
      
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: Cloudinary credentials not configured properly'
      });
    }
    
    // Upload to Cloudinary
    try {
      console.log('Attempting to upload to Cloudinary...');
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'maldives_activities',
        use_filename: true,
        unique_filename: true,
        resource_type: 'auto'
      });
      
      console.log('Cloudinary upload successful:', result.secure_url);
      
      // Remove the temporary file
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error('Error removing temp file after successful upload:', unlinkError);
        // Continue since the upload was successful
      }
      
      // Return the Cloudinary URL
      return res.status(200).json({
        url: result.secure_url,
        public_id: result.public_id
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      
      // Clean up the temporary file
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error('Error removing temp file after failed upload:', unlinkError);
        }
      }
      
      // Return error instead of fallback for debugging
      return res.status(500).json({
        success: false,
        error: `Cloudinary upload failed: ${cloudinaryError.message}`
      });
    }
  } catch (error) {
    console.error('Server error during upload:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Server error during upload: ' + error.message
    });
  }
};
