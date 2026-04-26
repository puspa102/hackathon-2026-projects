import type { HomeSummary } from '@/types/app-data';

const mockHomeSummary: HomeSummary = {
  greetingName: 'Sarah',
  summaryText: "Welcome back, Sarah. Let's see how you're doing today, dear.",
  medication: {
    label: 'NEXT MEDICATION',
    name: 'Lisinopril 10mg',
    dueText: 'Due at 10:30 AM',
    actionLabel: 'Take Now',
  },
  recoveryStatus: {
    title: 'Recovery Status',
    value: 'Normal',
  },
  checkIn: {
    title: "Today's Check-in",
    value: 'Pending',
    actionLabel: 'Start',
  },
  vitals: [
    { id: 'heart-rate', label: 'Heart Rate', value: '72', unit: 'bpm' },
    { id: 'blood-pressure', label: 'Blood Pressure', value: '120/80', unit: 'mmHg' },
  ],
  doctorMessage: {
    title: 'Message from Dr. Miller',
    message: '"I am so proud of the progress you\'re making with your walking goals, Sarah. You\'re doing a wonderful job!"',
  },
  emergencyLabel: 'EMERGENCY',
};

export async function getHomeSummary(): Promise<HomeSummary> {
  return Promise.resolve(mockHomeSummary);
}
