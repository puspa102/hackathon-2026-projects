import { getPatientData } from '../src/lib/fihr-client';

export default async function Home() {
  try {
    const data = await getPatientData('90270587');
    const patientName = data.patient?.name?.[0]?.given?.[0] ?? 'Unknown';
    console.log("Patient Name:", patientName);

    return (
      <main>
        <h1>Patient: {patientName}</h1>
        <pre>{JSON.stringify(data.vitals, null, 2)}</pre>
      </main>
    );
  } catch (error) {
    console.error("Failed to fetch patient data:", error);
    return (
      <main>
        <h1>Error loading patient data</h1>
        <p>{String(error)}</p>
      </main>
    );
  }
}
