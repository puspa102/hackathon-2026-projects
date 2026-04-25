import { supabase } from '../lib/supabase';

export async function getAvailableSpecialists(specialty?: string) {
  let query = supabase
    .from('specialists')
    .select('id, full_name, specialty, hospital, phone')
    .eq('available', true)
    .order('specialty');

  if (specialty) {
    query = query.ilike('specialty', `%${specialty}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data;
}
