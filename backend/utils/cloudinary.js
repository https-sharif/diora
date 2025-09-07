import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

console.log(`Cloudinary connected: ${process.env.CLOUDINARY_CLOUD_NAME}`);

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'posts',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'promotion-documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    resource_type: 'auto',
  },
});

const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      console.warn('deleteImage called with empty publicId');
      return false;
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      console.log(`Successfully deleted image: ${publicId}`);
      return true;
    } else {
      console.error(`Failed to delete image ${publicId}:`, result);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting image with public ID ${publicId}:`, error);
    return false;
  }
};

const uploadImageWithOptimization = async (file, options = {}) => {
  try {
    const {
      folder = 'posts',
      width = 800,
      height = 600,
      quality = 'auto',
      format = 'auto',
      crop = 'fill'
    } = options;

    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      width,
      height,
      quality,
      format,
      crop,
      transformation: [
        { width, height, crop },
        { quality },
        { fetch_format: format }
      ]
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Error uploading image with optimization:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const deleteImagesBatch = async (publicIds) => {
  if (!Array.isArray(publicIds) || publicIds.length === 0) {
    return { success: true, deleted: [], failed: [] };
  }

  const results = { deleted: [], failed: [] };

  for (const publicId of publicIds) {
    try {
      const success = await deleteImage(publicId);
      if (success) {
        results.deleted.push(publicId);
      } else {
        results.failed.push(publicId);
      }
    } catch (error) {
      console.error(`Failed to delete image ${publicId}:`, error);
      results.failed.push(publicId);
    }
  }

  return results;
};

const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      success: true,
      info: result
    };
  } catch (error) {
    console.error(`Error getting image info for ${publicId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

const parser = multer({ storage });
const documentParser = multer({ storage: documentStorage });

export {
  cloudinary,
  parser,
  documentParser,
  deleteImage,
  uploadImageWithOptimization,
  deleteImagesBatch,
  getImageInfo
};
