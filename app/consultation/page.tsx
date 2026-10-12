"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CommonNav from "../components/CommonNav";
import AllergyAlertDialog from "../components/AllergyAlertDialog";
import {
  completeVisit,
  getCompletedVisits,
  getRegistrations,
  getServerCompletedVisits,
  getServerRegistrations,
  subscribeToRegistrations,
} from "../lib/registrations";
import {
  getDemoMedications,
  getServerDemoMedications,
  saveDemoMedication,
  subscribeToDemoMedications,
} from "../lib/medications";

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getSelectedToken() {
  return new URLSearchParams(window.location.search).get("token") ?? "";
}

function getAllergyAlertRequested() {
  return new URLSearchParams(window.location.search).get("showAllergy") === "1";
}

const vitals = [
	{ label: "Heart rate", value: "78", unit: "bpm", status: "Normal" },
	{ label: "Blood pressure", value: "138/88", unit: "mmHg", status: "Mildly high" },
	{ label: "Oxygen", value: "98", unit: "%", status: "Normal" },
	{ label: "Temperature", value: "98.4", unit: "°F", status: "Normal" },
];

const examinationFindings = [
	{
		name: "General appearance",
		detail: "Alert and oriented. Well hydrated. No swelling in feet or pale conjunctiva.",
	},
	{
		name: "Heart & circulation",
		detail: "Regular rhythm. Heart sounds clear. No murmur or extra sounds detected.",
	},
	{
		name: "Lungs & breathing",
		detail: "Breath sounds clear and equal throughout both lung fields.",
	},
	{
		name: "Neurological & balance",
		detail: "Balance test negative. Lightheadedness triggered mainly when rising quickly.",
	},
];

const activeConditions = [
	["High blood pressure", "Managed since 2019"],
	["Type 2 diabetes", "Review HbA1c"],
	["High cholesterol", "On medication"],
];

const orderedTests = ["HbA1c", "Comprehensive lipid panel", "Serum creatinine"];
const defaultComplaints = "Patient reports occasional lightheadedness on standing over the past four days. Denies fainting, chest pain, or palpitations.";
const defaultPlan = "Continue current medication as directed. Rise slowly from bed, stay hydrated, and follow the recommended low-salt diet.";
const samplePrescriptions = [
  { id: "sample-1", name: "Telmisartan 40 mg", instructions: "Once daily · 30 days" },
  { id: "sample-2", name: "Metformin 500 mg SR", instructions: "Twice daily · 30 days" },
];

function Section({
	number,
	title,
	note,
	children,
}: {
	number: number;
	title: string;
	note: string;
	children: React.ReactNode;
}) {
	return (
		<section className="border-b border-slate-100 pb-6">
			<div className="mb-4 flex items-center gap-3">
				<span className="grid size-8 place-items-center rounded-lg bg-sky-100 text-sm font-bold text-sky-800">
					{number}
				</span>
				<h2 className="flex-1 font-bold">{title}</h2>
				<span className="hidden text-xs text-slate-400 sm:block">{note}</span>
			</div>
			{children}
		</section>
	);
}

function PatientContextSidebar({ onUpdateVitals }: { onUpdateVitals: () => void }) {
	return (
		<aside className="space-y-5">
			<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<div className="flex items-center justify-between">
					<h2 className="font-bold">Recorded vitals</h2>
					<button
						type="button"
						onClick={onUpdateVitals}
						className="text-sm font-semibold text-sky-700"
					>
						+ Update
					</button>
				</div>
				<p className="mb-4 mt-1 text-xs text-slate-500">
					Checked at 14:15 by triage nurse
				</p>
				<div className="grid grid-cols-2 gap-3">
					{vitals.map((vital) => (
						<article key={vital.label} className="rounded-xl bg-slate-50 p-3">
							<p className="text-xs text-slate-500">{vital.label}</p>
							<p className="mt-2 text-xl font-bold">
								{vital.value}
								<span className="ml-1 text-xs font-medium text-slate-500">
									{vital.unit}
								</span>
							</p>
							<span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
								{vital.status}
							</span>
						</article>
					))}
				</div>
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<h2 className="mb-3 font-bold">Active conditions</h2>
				{activeConditions.map(([name, detail]) => (
					<div key={name} className="border-t border-slate-100 py-3">
						<p className="text-sm font-semibold">{name}</p>
						<p className="mt-1 text-xs text-slate-500">{detail}</p>
					</div>
				))}
			</section>
		</aside>
	);
}

type ConsultationNotePanelProps = {
	complaintsRef: React.RefObject<HTMLTextAreaElement | null>;
	planRef: React.RefObject<HTMLTextAreaElement | null>;
	diagnosisQuery: string;
	onDiagnosisQueryChange: (query: string) => void;
	visibleDiagnoses: string[];
	draftSaved: boolean;
	onSaveDraft: () => void;
};

function ConsultationNotePanel({
	complaintsRef,
	planRef,
	diagnosisQuery,
	onDiagnosisQueryChange,
	visibleDiagnoses,
	draftSaved,
	onSaveDraft,
}: ConsultationNotePanelProps) {
	return (
		<section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
			<div className="border-b border-slate-100 pb-4">
				<div>
					<h2 className="text-xl font-bold">Consultation documentation</h2>
					<p className="mt-1 text-sm text-slate-500">Structured clinical note</p>
				</div>
			</div>

			<Section number={1} title="Patient complaints & symptoms" note="Subjective details">
				<p className="mb-3 text-sm text-slate-500">
					Reported:
					<span className="ml-2 rounded-full bg-sky-50 px-3 py-1 text-sky-800">
						Morning dizziness
					</span>
					<span className="ml-2 rounded-full bg-sky-50 px-3 py-1 text-sky-800">
						Routine BP follow-up
					</span>
				</p>
				<textarea
					ref={complaintsRef}
					className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-sky-500"
					defaultValue={defaultComplaints}
				/>
			</Section>

			<Section number={2} title="Physical checkup & examination" note="Objective findings">
				<div className="grid gap-3 sm:grid-cols-2">
					{examinationFindings.map((finding) => (
						<article
							key={finding.name}
							className="rounded-xl border border-slate-200 bg-slate-50 p-4"
						>
							<h3 className="text-xs font-bold uppercase tracking-wide text-sky-800">
								{finding.name}
							</h3>
							<p className="mt-2 text-sm leading-6 text-slate-600">
								{finding.detail}
							</p>
						</article>
					))}
				</div>
			</Section>

			<Section number={3} title="Assessment & diagnosis" note="Clinical impression">
				<input
					value={diagnosisQuery}
					onChange={(event) => onDiagnosisQueryChange(event.target.value)}
					className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
					placeholder="Search diagnosis…"
				/>
				<div className="mt-3 space-y-2">
					{visibleDiagnoses.length ? (
						visibleDiagnoses.map((diagnosis) => (
							<div
								key={diagnosis}
								className="rounded-lg border border-slate-200 px-3 py-3 text-sm font-medium"
							>
								{diagnosis}
							</div>
						))
					) : (
						<p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500">
							No sample diagnoses match that search.
						</p>
					)}
				</div>
			</Section>

			<Section number={4} title="Treatment plan & patient instructions" note="Care guidance">
				<textarea
					ref={planRef}
					className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm leading-6"
					defaultValue={defaultPlan}
				/>
			</Section>

			<button
				type="button"
				onClick={onSaveDraft}
				className="w-full rounded-xl bg-sky-800 px-4 py-3 font-bold text-white hover:bg-sky-900"
			>
				{draftSaved ? "Draft saved ✓" : "Save consultation draft"}
			</button>
		</section>
	);
}

type PrescriptionSidebarProps = {
	registrationExists: boolean;
	patientToken: string;
	medications: { id: string; name: string; instructions: string }[];
	showMedicineForm: boolean;
	onToggleMedicineForm: () => void;
	medicineName: string;
	onMedicineNameChange: (name: string) => void;
	medicineInstructions: string;
	onMedicineInstructionsChange: (instructions: string) => void;
	onAddMedication: (event: React.FormEvent<HTMLFormElement>) => void;
	isCompleted: boolean;
	onFinishVisit: () => void;
};

function PrescriptionSidebar({
	registrationExists,
	patientToken,
	medications,
	showMedicineForm,
	onToggleMedicineForm,
	medicineName,
	onMedicineNameChange,
	medicineInstructions,
	onMedicineInstructionsChange,
	onAddMedication,
	isCompleted,
	onFinishVisit,
}: PrescriptionSidebarProps) {
	return (
		<aside className="space-y-5">
			<section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
				<p className="font-bold text-emerald-800">✓ Medication safety check</p>
				<p className="mt-1 text-sm leading-5 text-emerald-700">
					Known penicillin allergy. Sample screen only; verify medicines with a
					qualified clinician.
				</p>
				<Link
					href={registrationExists ? `/consultation?showAllergy=1&token=${encodeURIComponent(patientToken)}` : "/consultation?showAllergy=1"}
					className="mt-3 inline-block text-sm font-semibold text-sky-800 underline"
				>
					Review allergy alert
				</Link>
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-bold">Prescriptions</h2>
					<button
						type="button"
						onClick={onToggleMedicineForm}
						className="text-xs font-semibold text-sky-700"
					>
						{showMedicineForm ? "Cancel" : "+ Add medicine"}
					</button>
				</div>
				<p className="mb-3 text-xs text-slate-500">
					Demo record only. This does not create or send a real medication order.
				</p>

				{showMedicineForm && (
					<form
						onSubmit={onAddMedication}
						className="mb-4 space-y-3 rounded-xl border border-sky-200 bg-sky-50 p-3"
					>
						<label className="block text-xs font-semibold text-slate-700">
							Medicine name
							<input
								required
								value={medicineName}
								onChange={(event) => onMedicineNameChange(event.target.value)}
								className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
								placeholder="Enter the medicine name"
							/>
						</label>
						<label className="block text-xs font-semibold text-slate-700">
							Instructions (optional)
							<input
								value={medicineInstructions}
								onChange={(event) => onMedicineInstructionsChange(event.target.value)}
								className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
								placeholder="Enter instructions"
							/>
						</label>
						<button
							type="submit"
							className="w-full rounded-lg bg-sky-800 px-3 py-2 text-sm font-semibold text-white"
						>
							Save demo medication
						</button>
					</form>
				)}

				{medications.length > 0 ? (
					medications.map((medication) => (
						<article
							key={medication.id}
							className="mb-3 rounded-xl border border-slate-200 p-3"
						>
							<h3 className="text-sm font-semibold">{medication.name}</h3>
							<p className="mt-1 text-xs text-slate-500">
								{medication.instructions}
							</p>
						</article>
					))
				) : (
					<p className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-500">
						No medicines have been added to this demo visit.
					</p>
				)}
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<h2 className="mb-3 font-bold">Ordered tests</h2>
				{orderedTests.map((test) => (
					<p key={test} className="border-t border-slate-100 py-3 text-sm">
						{test}
						<span className="float-right text-xs text-slate-400">Lab</span>
					</p>
				))}
			</section>

			<button
				type="button"
				onClick={onFinishVisit}
				disabled={isCompleted}
				className="w-full rounded-xl bg-sky-800 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-emerald-700"
			>
				{isCompleted ? "Visit completed ✓" : "Save & complete visit"}
			</button>
		</aside>
	);
}

export default function ConsultationPage() {
  const router = useRouter();
  const token = useSyncExternalStore(subscribeToLocation, getSelectedToken, () => "");
  const allergyAlertRequested = useSyncExternalStore(subscribeToLocation, getAllergyAlertRequested, () => false);
  const registrations = useSyncExternalStore(
    subscribeToRegistrations,
    getRegistrations,
    getServerRegistrations,
  );
  const completedVisits = useSyncExternalStore(
    subscribeToRegistrations,
    getCompletedVisits,
    getServerCompletedVisits,
  );
  const registration = registrations.find((item) => String(item.token) === token);
  const isCompleted = Boolean(completedVisits[token || "14"]);
  const [message, setMessage] = useState("");
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [medicineName, setMedicineName] = useState("");
  const [medicineInstructions, setMedicineInstructions] = useState("");
  const medicationToken = registration ? String(registration.token) : "";
  const subscribeToPatientMedications = useCallback(
    (callback: () => void) => medicationToken ? subscribeToDemoMedications(medicationToken, callback) : () => { },
    [medicationToken],
  );
  const getPatientMedications = useCallback(
    () => medicationToken ? getDemoMedications(medicationToken) : getServerDemoMedications(),
    [medicationToken],
  );
  const patientMedications = useSyncExternalStore(
    subscribeToPatientMedications,
    getPatientMedications,
    getServerDemoMedications,
  );
  const prescriptions = registration ? patientMedications : samplePrescriptions;
  const [diagnosisQuery, setDiagnosisQuery] = useState("");
  const diagnoses = [
    "Essential hypertension · Primary",
    "Postural dizziness · Current episode",
    "Type 2 diabetes · Monitoring",
  ];
  const visibleDiagnoses = diagnoses.filter((diagnosis) =>
    diagnosis.toLowerCase().includes(diagnosisQuery.toLowerCase()),
  );
  const patientName = registration?.name ?? "Ananya Sen";
  const patientToken = registration ? `#${registration.token}` : "#14";
  const patientAge = registration ? `${registration.age} yrs` : "58 yrs";
  const patientGender = registration?.gender ?? "Female";
  const patientUhid = registration ? `DEMO-${registration.token}` : "HYD-20412";
  const patientDoctor = registration?.physician ?? "Dr. K. Srinivas · Room 104";
  const closeAllergyAlert = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("showAllergy");
    const query = params.toString();
    router.replace(`/consultation${query ? `?${query}` : ""}`, { scroll: false });
  }, [router]);
  const complaintsRef = useRef<HTMLTextAreaElement>(null);
  const planRef = useRef<HTMLTextAreaElement>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const draftKey = `apollo-demo-consultation-draft-${registration?.token ?? "sample"}`;

  useEffect(() => {
    try {
      const savedDraft = window.localStorage.getItem(draftKey);
      if (!savedDraft) return;
      const draft = JSON.parse(savedDraft) as { complaints?: string; plan?: string };
      if (complaintsRef.current && typeof draft.complaints === "string") {
        complaintsRef.current.value = draft.complaints;
      }
      if (planRef.current && typeof draft.plan === "string") {
        planRef.current.value = draft.plan;
      }
    } catch {
      // Ignore invalid or unavailable demo storage and keep the sample note text.
    }
  }, [draftKey]);

  function saveConsultationDraft() {
    try {
      window.localStorage.setItem(
        draftKey,
        JSON.stringify({
          complaints: complaintsRef.current?.value ?? defaultComplaints,
          plan: planRef.current?.value ?? defaultPlan,
          savedAt: new Date().toISOString(),
        }),
      );
      setDraftSaved(true);
      setMessage("Consultation draft saved on this browser. It will be restored when you reopen this patient’s visit.");
    } catch {
      setDraftSaved(false);
      setMessage("Could not save the draft. Check browser storage settings and try again.");
    }
  }

  function finishVisit() {
    try {
      // History reads this note after the visit is marked complete.
      window.localStorage.setItem(
        draftKey,
        JSON.stringify({
          complaints: complaintsRef.current?.value ?? defaultComplaints,
          plan: planRef.current?.value ?? defaultPlan,
          savedAt: new Date().toISOString(),
        }),
      );
      completeVisit(token || "14");
      router.push(`/queue?token=${encodeURIComponent(token || "14")}`);
    } catch {
      setMessage("Could not mark this visit complete. Check browser storage settings and try again.");
    }
  }

  function addMedication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!registration) {
      setMessage("Open a registered patient before adding a medication to their demo visit.");
      return;
    }
    try {
      saveDemoMedication(String(registration.token), {
        id: crypto.randomUUID(),
        name: medicineName.trim(),
        instructions: medicineInstructions.trim() || "Instructions not entered",
      });
      setMedicineName("");
      setMedicineInstructions("");
      setShowMedicineForm(false);
      setMessage("Demo medication added to this patient’s visit and saved in this browser.");
    } catch {
      setMessage("Could not save this demo medication. Check browser storage settings and try again.");
    }
  }

  const allergyBannerClass = registration?.isEmergency
    ? "border-rose-300 bg-rose-50 text-rose-800"
    : registration
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-rose-200 bg-rose-50 text-rose-800";
  const allergyBannerText = registration?.isEmergency
    ? registration.emergencyReason
      ? "🚨 Emergency triage requested: " + registration.emergencyReason + ". Prioritize staff review. Clinical notes below are sample content."
      : "🚨 Emergency triage requested. Prioritize staff review. Clinical notes below are sample content."
    : registration
      ? "⚠ No allergy or medical history was entered during registration. Confirm these details with the patient before care; clinical notes below are sample content."
      : "⚠ Sample patient: severe penicillin allergy (anaphylaxis). Check medication safety before prescribing.";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <CommonNav active={allergyAlertRequested ? "/prescribing" : "/consultation"} />
      <main className="mx-auto max-w-[1500px] px-4 py-6 md:px-8 md:py-8">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
            Token {patientToken} · Active consultation
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{patientName}</h1>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
              {patientAge} · {patientGender}
            </span>
            <span className="text-sm text-slate-500">
              UHID: {patientUhid} · {patientDoctor}
            </span>
          </div>
          <div className={"mt-4 rounded-xl border px-4 py-3 text-sm font-medium " + allergyBannerClass}>
            {allergyBannerText}
          </div>
        </header>

        {message && (
          <p role="status" className="mb-5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            {message}
          </p>
        )}

        <div className="grid items-start gap-6 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
          <PatientContextSidebar
            onUpdateVitals={() => setMessage("Vitals are sample values in this frontend demo.")}
          />

          <ConsultationNotePanel
            complaintsRef={complaintsRef}
            planRef={planRef}
            diagnosisQuery={diagnosisQuery}
            onDiagnosisQueryChange={setDiagnosisQuery}
            visibleDiagnoses={visibleDiagnoses}
            draftSaved={draftSaved}
            onSaveDraft={saveConsultationDraft}
          />

          <PrescriptionSidebar
            registrationExists={Boolean(registration)}
            patientToken={token}
            medications={prescriptions}
            showMedicineForm={showMedicineForm}
            onToggleMedicineForm={() => setShowMedicineForm((show) => !show)}
            medicineName={medicineName}
            onMedicineNameChange={setMedicineName}
            medicineInstructions={medicineInstructions}
            onMedicineInstructionsChange={setMedicineInstructions}
            onAddMedication={addMedication}
            isCompleted={isCompleted}
            onFinishVisit={finishVisit}
          />
        </div>
      </main>

      {allergyAlertRequested && (
        <AllergyAlertDialog
          patientName={patientName}
          knownSampleAllergy={!registration}
          onClose={closeAllergyAlert}
        />
      )}
    </div>
  );
}
