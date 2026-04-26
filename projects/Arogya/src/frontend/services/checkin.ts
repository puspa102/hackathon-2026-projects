import { authStorage } from "@/services/storage";
import { API_BASE_URL } from "@/services/config";
import type { CheckInFormData, SymptomOption } from "@/types/app-data";

const SYMPTOM_OPTIONS: SymptomOption[] = [
  { id: "headache", label: "Headache", icon: "mood-bad" },
  { id: "nausea", label: "Nausea", icon: "sick" },
  { id: "fatigue", label: "Fatigue", icon: "dark-mode" },
  { id: "dizziness", label: "Dizziness", icon: "trending-up" },
  { id: "chest_pain", label: "Chest Pain", icon: "favorite" },
  { id: "shortness_of_breath", label: "Short of Breath", icon: "air" },
  { id: "fever", label: "Fever", icon: "thermostat" },
  { id: "bleeding", label: "Bleeding", icon: "water-drop" },
];

export async function getCheckInForm(): Promise<CheckInFormData> {
  return Promise.resolve({
    patientName: "",
    title: "Daily Check-in",
    subtitle: "How are you feeling today?",
    symptomOptions: SYMPTOM_OPTIONS,
    selectedSymptoms: [],
    painLevel: 0,
    hasFever: false,
    temperature: "98.6",
    hasBreathingIssues: false,
    notes: "",
  });
}

export async function submitCheckIn(form: CheckInFormData): Promise<any> {
  const token = await authStorage.getToken();

  // Build the symptoms string from selected symptom labels + notes
  const selectedLabels = form.selectedSymptoms
    .map((id) => SYMPTOM_OPTIONS.find((s) => s.id === id)?.label ?? id)
    .join(", ");
  const symptomsText =
    [selectedLabels, form.notes].filter(Boolean).join(". ") ||
    "General check-in";

  const response = await fetch(`${API_BASE_URL}/checkins/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      symptoms: symptomsText,
      pain_level: form.painLevel,
      fever: form.hasFever,
      breathing_problem: form.hasBreathingIssues,
      bleeding: form.selectedSymptoms.includes("bleeding"),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Failed to submit check-in");
  }

  return response.json();
}
