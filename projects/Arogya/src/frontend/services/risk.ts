import { authStorage } from "@/services/storage";
import { API_BASE_URL } from "@/services/config";
import type { RiskResultSummary } from "@/types/app-data";

interface CheckIn {
  id: number;
  symptoms: string;
  pain_level: number;
  fever: boolean;
  breathing_problem: boolean;
  bleeding: boolean;
  risk_level: "normal" | "warning" | "emergency";
  guidance: string;
  created_at: string;
}

function buildRiskSummary(checkin: CheckIn): RiskResultSummary {
  const level = checkin.risk_level;

  const titleMap = {
    normal: "All Clear",
    warning: "Warning",
    emergency: "Emergency",
  };
  const title = titleMap[level] ?? "Result";

  const metrics: RiskResultSummary["metrics"] = [];

  if (checkin.pain_level > 0) {
    const isHigh = checkin.pain_level >= 7;
    metrics.push({
      id: "pain",
      title: "Pain Level",
      icon: "sentiment-very-dissatisfied",
      iconColor: isHigh ? "#DC2626" : "#F59E0B",
      value: `${checkin.pain_level}/10`,
      badgeLabel: isHigh ? "High" : "Moderate",
      badgeColor: isHigh ? "#DC2626" : "#F59E0B",
      badgeBackground: isHigh ? "#FEE2E2" : "#FEF3C7",
    });
  }

  if (checkin.fever) {
    metrics.push({
      id: "fever",
      title: "Fever",
      icon: "thermostat",
      iconColor: "#F59E0B",
      value: "Yes",
      badgeLabel: "Reported",
      badgeColor: "#F59E0B",
      badgeBackground: "#FEF3C7",
    });
  }

  if (checkin.breathing_problem) {
    metrics.push({
      id: "breathing",
      title: "Breathing",
      icon: "air",
      iconColor: "#DC2626",
      value: "Issues",
      badgeLabel: "Critical",
      badgeColor: "#DC2626",
      badgeBackground: "#FEE2E2",
    });
  }

  if (metrics.length === 0) {
    metrics.push({
      id: "status",
      title: "Overall",
      icon: "check-circle",
      iconColor: "#16A34A",
      value: "Good",
      badgeLabel: "Normal",
      badgeColor: "#16A34A",
      badgeBackground: "#DCFCE7",
    });
  }

  const insightMap = {
    normal:
      "Your condition looks stable. Continue following your discharge instructions and keep up with your daily check-ins.",
    warning:
      "Some warning signs were detected. Please monitor your condition closely and contact your doctor if symptoms worsen.",
    emergency:
      "Critical symptoms detected. Please seek immediate medical attention or call emergency services.",
  };

  const supportMap = {
    normal:
      '"Great job staying on track! Your care team is monitoring your progress and will reach out if needed."',
    warning:
      '"Your care team has been notified of your current status. Please rest and avoid strenuous activity."',
    emergency:
      '"Emergency services have been alerted. Stay calm, sit down, and wait for assistance."',
  };

  return {
    title,
    severityLabel: title,
    message: checkin.guidance || insightMap[level],
    metrics,
    physicianInsightTitle: "Physician's Insight",
    physicianInsightMessage: insightMap[level],
    primaryActionLabel: "Chat with Doctor",
    secondaryActionLabel:
      level === "emergency" ? "Call Emergency" : "View Emergency Info",
    supportMessage: supportMap[level],
  };
}

export async function getRiskResultSummary(): Promise<RiskResultSummary> {
  try {
    const token = await authStorage.getToken();
    const res = await fetch(`${API_BASE_URL}/checkins/`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch check-ins");
    const data: CheckIn[] = await res.json();
    const latest = Array.isArray(data) ? data[0] : null;
    if (!latest) throw new Error("No check-ins found");
    return buildRiskSummary(latest);
  } catch {
    // Fallback: show a neutral result if no check-ins exist yet
    return {
      title: "No Data",
      severityLabel: "No Data",
      message:
        "Complete your first daily check-in to see your risk assessment.",
      metrics: [],
      physicianInsightTitle: "Physician's Insight",
      physicianInsightMessage:
        "No check-in data available yet. Submit a daily check-in to receive your personalized risk assessment.",
      primaryActionLabel: "Start Check-in",
      secondaryActionLabel: "View Emergency Info",
      supportMessage:
        '"Your health journey starts here. Complete your first check-in today!"',
    };
  }
}
