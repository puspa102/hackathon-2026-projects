import { supabase } from '../lib/supabase';

export async function createPatientAndReferral(
  doctorId: string,
  patientData: {
    full_name: string;
    date_of_birth?: string;
    gender?: string;
    email?: string;
    phone?: string;
    medical_history?: string;
  },
  referralData: {
    specialist_id: string;
    clinical_notes: string;
    extracted_data?: object;
    diagnosis?: string;
    required_specialty?: string;
    urgency: 'low' | 'medium' | 'high';
  }
) {
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .insert(patientData)
    .select()
    .single();

  if (patientError) throw new Error(patientError.message);

  const { data: referral, error: referralError } = await supabase
    .from('referrals')
    .insert({ doctor_id: doctorId, patient_id: patient.id, ...referralData })
    .select()
    .single();

  if (referralError) throw new Error(referralError.message);

  return { patient, referral };
}

export async function getReferralsByDoctor(doctorId: string) {
  const { data, error } = await supabase
    .from('referrals')
    .select(`
      id, clinical_notes, diagnosis, urgency, status, created_at,
      patients (id, full_name),
      specialists (id, full_name, specialty, hospital)
    `)
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getReferralById(referralId: string, doctorId: string) {
  const { data, error } = await supabase
    .from('referrals')
    .select(`
      *,
      patients (*),
      specialists (*),
      referral_status_history (status, changed_at)
    `)
    .eq('id', referralId)
    .eq('doctor_id', doctorId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateReferralStatus(
  referralId: string,
  doctorId: string,
  status: 'pending' | 'sent' | 'accepted' | 'completed'
) {
  const { data, error } = await supabase
    .from('referrals')
    .update({ status })
    .eq('id', referralId)
    .eq('doctor_id', doctorId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
