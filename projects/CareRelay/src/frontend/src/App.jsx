import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Bot,
  CreditCard,
  FileText,
  HeartPulse,
  Loader2,
  Pill,
  QrCode,
  Stethoscope,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { generateBrief, getDrugWarnings, getPatient, getQr } from "./api/careRelayApi";
import { compactCondition, display, shortMedName, titleCase } from "./utils/format";

const views = [
  { id: "snapshot", label: "Snapshot", icon: Stethoscope },
  { id: "deepDive", label: "Deep Dive", icon: Activity },
  { id: "idCard", label: "ID Card", icon: CreditCard },
];

const metricOrder = ["hba1c", "blood_pressure", "ldl", "egfr", "weight", "glucose"];

export default function App() {
  const [activeView, setActiveView] = useState("snapshot");
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPatient()
      .then(setPatientData)
      .catch(() => setError("Backend is not reachable. Start Flask at http://127.0.0.1:5000."));
  }, []);

  if (error) {
    return (
      <main className="center-screen">
        <div className="error-card">
          <AlertTriangle size={28} />
          <h1>CareRelay backend needed</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!patientData) {
    return (
      <main className="center-screen">
        <Loader2 className="spin" size={32} />
        <p>Loading patient snapshot...</p>
      </main>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">CR</div>
          <div>
            <strong>CareRelay</strong>
            <span>Clinician snapshot</span>
          </div>
        </div>
        <nav className="nav">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                className={activeView === view.id ? "nav-item active" : "nav-item"}
                key={view.id}
                onClick={() => setActiveView(view.id)}
              >
                <Icon size={18} />
                {view.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <BadgeCheck size={16} />
          Synthetic Synthea data. Not for clinical use.
        </div>
      </aside>

      <main className="main">
        <DisclaimerBanner text={patientData.disclaimer} />
        {activeView === "snapshot" && <Snapshot data={patientData} />}
        {activeView === "deepDive" && <DeepDive data={patientData} />}
        {activeView === "idCard" && <IDCard data={patientData} />}
      </main>
    </div>
  );
}

function DisclaimerBanner({ text }) {
  return (
    <div className="disclaimer">
      <AlertTriangle size={16} />
      {text}
    </div>
  );
}

function Snapshot({ data }) {
  return (
    <section className="page">
      <PatientHeader data={data} />
      <MetricGrid metrics={data.snapshot.latestMetrics} />
      <div className="snapshot-grid">
        <ClinicalState data={data} />
        <AIBriefPanel />
      </div>
      <div className="three-col">
        <AllergyPanel allergies={data.snapshot.allergies} />
        <ConditionsPanel conditions={data.snapshot.activeConditions} />
        <MedicationPanel medications={data.snapshot.currentMedications} />
      </div>
      <DrugWarnings medications={data.snapshot.currentMedications} />
    </section>
  );
}

function PatientHeader({ data }) {
  const patient = data.patient;
  return (
    <header className="patient-hero">
      <div>
        <div className="eyebrow">QR-linked synthetic patient record</div>
        <h1>{patient.name}</h1>
        <p>
          {titleCase(patient.gender)} · {patient.age} · MRN {patient.mrn}
        </p>
      </div>
      <div className="header-facts">
        <Fact label="Blood type" value={patient.bloodType} />
        <Fact label="Code status" value={patient.codeStatus} />
        <Fact label="Address" value={patient.address} />
      </div>
    </header>
  );
}

function Fact({ label, value }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{display(value)}</strong>
    </div>
  );
}

function MetricGrid({ metrics }) {
  return (
    <div className="metric-grid">
      {metricOrder.map((key) => {
        const metric = metrics[key];
        if (!metric) return null;
        return (
          <article className="metric-card" key={key}>
            <span>{metric.label}</span>
            <strong>{metric.displayValue}</strong>
            <small>{metric.date}</small>
          </article>
        );
      })}
    </div>
  );
}

function ClinicalState({ data }) {
  return (
    <section className="panel clinical-state">
      <div className="panel-title">
        <HeartPulse size={18} />
        <h2>Clinical State At A Glance</h2>
      </div>
      <div className="status-pill">Structured snapshot</div>
      <p>{data.snapshot.aiStatusLine}</p>
      <div className="mini-stats">
        <span>{data.conditions.length} conditions</span>
        <span>{data.medications.length} medications</span>
        <span>{data.encounters.length} recent encounters</span>
      </div>
    </section>
  );
}

function AIBriefPanel() {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBrief() {
    setLoading(true);
    setError("");
    try {
      setBrief(await generateBrief());
    } catch {
      setError("Unable to generate brief. Check backend and Hugging Face token.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-title">
        <Bot size={18} />
        <h2>First Visit Brief</h2>
      </div>
      <button className="primary-button" disabled={loading} onClick={handleBrief}>
        {loading ? <Loader2 className="spin" size={16} /> : <FileText size={16} />}
        {loading ? "Generating..." : "Generate First Visit Brief"}
      </button>
      {error && <p className="error-text">{error}</p>}
      {brief && (
        <div className="brief-box">
          <p>{brief.brief}</p>
          <small>
            Source: {brief.source} · Model: {brief.model || "fallback"}
          </small>
        </div>
      )}
    </section>
  );
}

function AllergyPanel({ allergies }) {
  return (
    <section className="panel">
      <div className="panel-title danger-title">
        <AlertTriangle size={18} />
        <h2>Allergies</h2>
      </div>
      <div className="chip-wrap">
        {allergies.length ? (
          allergies.map((allergy) => (
            <span className="chip danger" key={allergy.name}>
              {compactCondition(allergy.name)}
            </span>
          ))
        ) : (
          <p className="muted">No allergies documented.</p>
        )}
      </div>
    </section>
  );
}

function ConditionsPanel({ conditions }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <Activity size={18} />
        <h2>Active Conditions</h2>
      </div>
      <div className="chip-wrap">
        {conditions.slice(0, 12).map((condition) => (
          <span className="chip" key={condition.name}>
            {compactCondition(condition.name)}
          </span>
        ))}
      </div>
    </section>
  );
}

function MedicationPanel({ medications }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <Pill size={18} />
        <h2>Current Medications</h2>
      </div>
      <div className="list">
        {medications.slice(0, 8).map((med) => (
          <div className="list-row" key={med.name}>
            <strong>{shortMedName(med.name)}</strong>
            <span>{med.status} · {med.authoredOn || "date unknown"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DrugWarnings({ medications }) {
  const [warnings, setWarnings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkWarnings() {
    setLoading(true);
    setError("");
    try {
      const medNames = medications.slice(0, 5).map((med) => med.name);
      setWarnings(await getDrugWarnings(medNames));
    } catch {
      setError("Unable to check OpenFDA labels.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel wide-panel">
      <div className="panel-title danger-title">
        <AlertTriangle size={18} />
        <h2>OpenFDA Medication Warnings</h2>
      </div>
      <button className="secondary-button" disabled={loading} onClick={checkWarnings}>
        {loading ? <Loader2 className="spin" size={16} /> : <Pill size={16} />}
        {loading ? "Checking..." : "Check Current Medications"}
      </button>
      {error && <p className="error-text">{error}</p>}
      {warnings && (
        <div className="warning-grid">
          {warnings.warnings.map((warning) => (
            <article className="warning-card" key={warning.medication}>
              <strong>{warning.medication}</strong>
              <p>{warning.interaction || warning.warning}</p>
              <small>{warning.source}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function DeepDive({ data }) {
  return (
    <section className="page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Patient timeline and trends</div>
          <h1>Deep Dive</h1>
        </div>
        <div className="segment">
          {["All", "Cardiology", "Endocrinology", "Nephrology"].map((item) => (
            <button key={item}>{item}</button>
          ))}
        </div>
      </div>
      <TrendCharts trends={data.trends} />
      <div className="deep-grid">
        <Timeline timeline={data.timeline} />
        <ConditionThreads threads={data.conditionThreads} />
      </div>
      <EncounterReel encounters={data.encounters} />
    </section>
  );
}

function TrendCharts({ trends }) {
  const bp = (trends.blood_pressure || []).map((item) => ({
    date: item.date,
    systolic: item.value?.systolic,
    diastolic: item.value?.diastolic,
  }));
  return (
    <div className="chart-grid">
      <ChartPanel title="HbA1c" data={trends.hba1c || []} dataKey="value" unit="%" />
      <ChartPanel title="LDL" data={trends.ldl || []} dataKey="value" unit="mg/dL" />
      <ChartPanel title="eGFR" data={trends.egfr || []} dataKey="value" unit="" />
      <section className="panel chart-panel">
        <h2>Blood Pressure</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={bp.slice(-30)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d7eeee" />
            <XAxis dataKey="date" hide />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="systolic" stroke="#0b4f4a" dot={false} />
            <Line type="monotone" dataKey="diastolic" stroke="#00baa7" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

function ChartPanel({ title, data, dataKey, unit }) {
  return (
    <section className="panel chart-panel">
      <h2>{title}</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={(data || []).slice(-30)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7eeee" />
          <XAxis dataKey="date" hide />
          <YAxis />
          <Tooltip formatter={(value) => `${value} ${unit}`} />
          <Line type="monotone" dataKey={dataKey} stroke="#00baa7" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}

function Timeline({ timeline }) {
  return (
    <section className="panel">
      <h2>Patient Timeline</h2>
      <div className="timeline">
        {timeline.slice(-18).reverse().map((event, index) => (
          <div className="timeline-row" key={`${event.date}-${event.title}-${index}`}>
            <span className={`timeline-dot ${event.type}`} />
            <div>
              <strong>{event.title}</strong>
              <p>{event.date} · {event.type}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ConditionThreads({ threads }) {
  return (
    <section className="panel">
      <h2>Condition Threads</h2>
      <div className="list">
        {threads.map((thread) => (
          <div className="list-row" key={thread.title}>
            <strong>{thread.title}</strong>
            <span>
              {thread.conditions.length} conditions · {thread.medications.length} meds ·{" "}
              {thread.recentLabs.length} labs
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function EncounterReel({ encounters }) {
  return (
    <section className="panel wide-panel">
      <h2>Recent Encounters</h2>
      <div className="encounter-grid">
        {encounters.slice(-12).reverse().map((encounter) => (
          <article className="encounter-card" key={encounter.id}>
            <strong>{encounter.type}</strong>
            <span>{encounter.date}</span>
            <p>{encounter.provider || "Provider not listed"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function IDCard({ data }) {
  const [qr, setQr] = useState(null);

  useEffect(() => {
    getQr().then(setQr).catch(() => setQr(null));
  }, []);

  const meds = data.snapshot.currentMedications.slice(0, 4);
  const allergies = data.snapshot.allergies;
  return (
    <section className="page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Patient-carried access</div>
          <h1>Medical ID Card</h1>
        </div>
      </div>
      <div className="card-stage">
        <article className="medical-card">
          <div className="card-topline">CareRelay Medical ID</div>
          <h2>{data.patient.name}</h2>
          <p>{titleCase(data.patient.gender)} · {data.patient.age} · MRN {data.patient.mrn}</p>
          <div className="card-section">
            <strong>Critical allergies</strong>
            <span>{allergies.map((item) => compactCondition(item.name)).join(", ") || "None documented"}</span>
          </div>
          <div className="card-section">
            <strong>Key medications</strong>
            <span>{meds.map((item) => shortMedName(item.name)).join(", ")}</span>
          </div>
          <div className="card-footer">Emergency contact: Demo placeholder</div>
        </article>

        <article className="medical-card back">
          <div className="card-topline">Scan for clinician snapshot</div>
          <div className="qr-box">
            {qr ? <img src={qr.qr} alt="CareRelay QR code" /> : <QrCode size={96} />}
          </div>
          <p>{qr?.url || "http://localhost:5173/patient/default"}</p>
          <div className="card-footer">Synthetic demo only. Not for clinical use.</div>
        </article>
      </div>
    </section>
  );
}
