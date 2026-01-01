import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { uploadAvatar } from "../services/cloudinary";
import { usersService } from "../services/db";

/**
 * Edit Profile Controller Hook
 * Handles business logic for editing user profile
 */
export function useEditProfileController() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = async (
    name: string,
    phone: string,
    avatarUri?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: "User not found" };
    }

    try {
      setIsLoading(true);
      setError(null);

      // Validation
      if (!name.trim()) {
        setIsLoading(false);
        return { success: false, error: "Name is required" };
      }

      // Prepare update data
      const updateData: {
        name: string;
        phone?: string;
        avatar?: string | null;
      } = {
        name: name.trim(),
      };

      // Update phone if provided
      if (phone.trim()) {
        updateData.phone = phone.trim();
      }

      // Handle avatar update
      if (avatarUri !== undefined) {
        if (avatarUri && avatarUri.trim().length > 0) {
          // Check if this is a local file URI (needs upload)
          const isLocalFile = 
            avatarUri.startsWith('file://') || 
            avatarUri.startsWith('content://') || 
            avatarUri.startsWith('ph://') ||
            avatarUri.startsWith('assets-library://');
          
          if (isLocalFile) {
            // Upload new image to Cloudinary
            try {
              const avatarUrl = await uploadAvatar(avatarUri, user.id);
              updateData.avatar = avatarUrl;
            } catch (uploadError: any) {
              setIsLoading(false);
              return {
                success: false,
                error: uploadError.message || "Failed to upload avatar image",
              };
            }
          } else {
            // Already a remote URL (shouldn't happen, but handle it)
            updateData.avatar = avatarUri;
          }
        } else {
          // User wants to remove avatar
          updateData.avatar = null;
        }
      }
      // If avatarUri is undefined, don't include avatar in update (keeps existing)

      // Filter out undefined values before sending to Firestore
      const cleanUpdateData: Record<string, any> = {};
      Object.keys(updateData).forEach(key => {
        const value = (updateData as any)[key];
        if (value !== undefined) {
          cleanUpdateData[key] = value;
        }
      });

      // Update user in Firestore
      await usersService.updateUser(user.id, cleanUpdateData);

      // Refresh user data in AuthContext
      await refreshUser();

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setIsLoading(false);
      const errorMessage = String(err?.message || err || "Failed to update profile");
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    handleUpdateProfile,
    isLoading,
    error,
  };
}

