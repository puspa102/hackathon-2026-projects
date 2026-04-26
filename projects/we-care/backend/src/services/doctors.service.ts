import { supabase } from '../lib/supabase';

export async function uploadAvatar(doctorId: string, fileBuffer: Buffer, mimeType: string) {
  const filePath = `avatars/${doctorId}`;

  const { error: uploadError } = await supabase.storage
    .from('doctor-profiles')
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage
    .from('doctor-profiles')
    .getPublicUrl(filePath);

  return { avatar_url: data.publicUrl };
}

export async function updateDoctorProfile(
  doctorId: string,
  updates: {
    full_name?: string;
    email?: string;
  }
) {
  const { data, error } = await supabase
    .from('doctors')
    .update(updates)
    .eq('id', doctorId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getDoctorProfile(doctorId: string) {
  const { data, error } = await supabase
    .from('doctors')
    .select('id, full_name, email, created_at')
    .eq('id', doctorId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
