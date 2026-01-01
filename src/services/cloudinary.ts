// Get these from your Cloudinary dashboard
const CLOUDINARY_CLOUD_NAME = 'dhoi760j1'; // Replace with your cloud name
const CLOUDINARY_UPLOAD_PRESET = 'egrocery-mobile-upload'; // Replace with your upload preset
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export interface UploadResult {
  secure_url: string;
  public_id: string;
}

/**
 * Upload image to Cloudinary using fetch API
 * @param imageUri - Local URI of the image (from ImagePicker)
 * @param folder - Folder path in Cloudinary (e.g., 'avatars' or 'products')
 * @param publicId - Optional custom public ID (if not provided, Cloudinary generates one)
 */
export const uploadToCloudinary = async (
  imageUri: string,
  folder: string,
  publicId?: string
): Promise<UploadResult> => {
  try {
    // Create FormData
    const formData = new FormData();
    
    // Get filename from URI or use default
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Append file to FormData
    formData.append('file', {
      uri: imageUri,
      type: type,
      name: filename,
    } as any);

    // Append upload preset
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    // Append folder
    if (folder) {
      formData.append('folder', folder);
    }

    // Append public_id if provided
    if (publicId) {
      formData.append('public_id', publicId);
    }

    // Upload to Cloudinary
    // Note: Don't set Content-Type header - React Native sets it automatically with boundary
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message || 'Cloudinary upload error');
    }
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    console.error('Error details:', error.message || error);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Upload avatar image
 */
export const uploadAvatar = async (imageUri: string, userId: string): Promise<string> => {
  const result = await uploadToCloudinary(imageUri, 'avatars', `avatars/${userId}`);
  return result.secure_url;
};

/**
 * Upload product image
 */
export const uploadProductImage = async (
  imageUri: string,
  productId: string,
  storeId?: string
): Promise<string> => {
  const folder = storeId ? `products/${storeId}` : 'products';
  const result = await uploadToCloudinary(imageUri, folder, `${folder}/${productId}`);
  return result.secure_url;
};