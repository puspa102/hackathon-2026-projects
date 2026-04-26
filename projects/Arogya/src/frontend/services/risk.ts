import type { RiskResultSummary } from '@/types/app-data';

const mockRiskResultSummary: RiskResultSummary = {
  title: 'Warning',
  severityLabel: 'Warning',
  message:
    "I've noticed a small change in how you're feeling, and I want to make sure you're getting all the support you need. It might be a good idea to reach out to your doctor just to be safe.",
  metrics: [
    {
      id: 'blood-pressure',
      title: 'Blood Pressure',
      icon: 'monitor-heart',
      iconColor: '#F59E0B',
      value: '142/95',
      unit: 'MMHG',
      badgeLabel: 'Elevated',
      badgeColor: '#F59E0B',
      badgeBackground: '#FFF1D8',
    },
    {
      id: 'fatigue',
      title: 'Fatigue',
      icon: 'bolt',
      iconColor: '#0B63B0',
      value: 'High',
      badgeLabel: 'Reported',
      badgeColor: '#4B5563',
      badgeBackground: '#EFF1F4',
    },
  ],
  physicianInsightTitle: "A Note from Your Care Team",
  physicianInsightMessage:
    "Your recent values are just a little bit higher than usual, about 12% above your 7-day average. Please don't worry—this can sometimes happen when you need a bit more hydration or a moment of rest. We're keeping a close eye on everything for you.",
  primaryActionLabel: 'Chat with Doctor',
  secondaryActionLabel: 'View Emergency Info',
  supportMessage:
    "\"Take a deep breath, dear. We've gently notified Dr. Aris about these results so they can look over everything. You're in good hands, and we're right here with you.\"",
};

export async function getRiskResultSummary(): Promise<RiskResultSummary> {
  return Promise.resolve(mockRiskResultSummary);
}
