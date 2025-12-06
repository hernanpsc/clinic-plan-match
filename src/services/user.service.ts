import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
}

/**
 * Get user profile by user ID
 */
export const getProfile = async (userId: string): Promise<{ profile: Profile | null; error: Error | null }> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  return {
    profile: data as Profile | null,
    error: error as Error | null,
  };
};

/**
 * Update user profile
 */
export const updateProfile = async (
  userId: string,
  profileData: UpdateProfileData
): Promise<{ profile: Profile | null; error: Error | null }> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();

  return {
    profile: data as Profile | null,
    error: error as Error | null,
  };
};

/**
 * Upload user avatar and update profile
 */
export const uploadAvatar = async (
  userId: string,
  file: File
): Promise<{ avatarUrl: string | null; error: Error | null }> => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    return { avatarUrl: null, error: uploadError as Error };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const avatarUrl = urlData.publicUrl;

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (updateError) {
    return { avatarUrl: null, error: updateError as Error };
  }

  return { avatarUrl, error: null };
};

const UserService = {
  getProfile,
  updateProfile,
  uploadAvatar,
};

export default UserService;
