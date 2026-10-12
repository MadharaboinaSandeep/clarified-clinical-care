"use client";

import { useState, useSyncExternalStore } from "react";
import CommonNav from "../components/CommonNav";
import { useSelectedPatientToken } from "../lib/patient-navigation";
import {
	getCompletedVisits,
	getRegistrations,
	getServerCompletedVisits,
	getServerRegistrations,
	registrationsEventName,
	subscribeToRegistrations,
} from "../lib/registrations";

type SavedConsultationNote = {
	complaints?: string;
	plan?: string;
	savedAt?: string;
};

type HistoryEvent = {
	date: string;
	place: string;
	label: string;
	title: string;
	doctor: string;
	text: string;
	color: string;
};

const sampleEvents: HistoryEvent[] = [
	{
		date: "02 Oct 2026 · 02:15 PM",
		place: "Apollo HITECH City",
		label: "Active consult note",
		title: "Outpatient consultation",
		doctor: "Dr. K. Srinivas · Internal Medicine",
		text: "Routine review for hypertension and Type 2 diabetes. Blood pressure is steady but slightly elevated at 138/88 mmHg.",
		color: "bg-sky-600",
	},
	{
		date: "14 Apr 2026 · 11:30 AM",
		place: "Apollo Jubilee Hills",
		label: "Specialist assessment",
		title: "Cardiology specialist assessment",
		doctor: "Dr. Ashok Bharadwaj · Cardiology",
		text: "Evaluated for intermittent exertional chest tightness. Stress testing showed no inducible ischemia.",
		color: "bg-sky-600",
	},
	{
		date: "22 Dec 2025 · 08:45 AM",
		place: "City Care Hospital",
		label: "Emergency observation",
		title: "Emergency care & observation",
		doctor: "Dr. Sarah Jenkins · Emergency",
		text: "Presented with acute dizziness and dehydration. Fluids were given and symptoms improved during observation.",
		color: "bg-rose-500",
	},
	{
		date: "18 Jul 2025 · 09:10 AM",
		place: "Apollo Clinic · Kondapur",
		label: "Annual health check",
		title: "Preventive health review",
		doctor: "Dr. Meenakshi Sundaram · Family Medicine",
		text: "Health check noted elevated HbA1c. Started lifestyle counselling and first-line diabetes treatment.",
		color: "bg-slate-400",
	},
];

const historyReferenceDate = Date.parse("2026-10-07T00:00:00");
const historyPeriods = ["All history", "Past 30 days", "Past 6 months", "Past year"];

function getSavedConsultationNote(token: string): string | null {
	if (!token || typeof window === "undefined") return null;

	try {
		return window.localStorage.getItem(`apollo-demo-consultation-draft-${token}`);
	} catch {
		return null;
	}
}

function subscribeToSavedNotes(callback: () => void) {
	window.addEventListener(registrationsEventName, callback);
	window.addEventListener("storage", callback);

	return () => {
		window.removeEventListener(registrationsEventName, callback);
		window.removeEventListener("storage", callback);
	};
}

function SampleHistoryCard({ event }: { event: HistoryEvent }) {
	return (
		<article className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<span
				className={`absolute -left-[31px] top-6 size-4 rounded-full border-4 border-slate-50 ${event.color}`}
			/>
			<div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-3 text-xs text-slate-500">
				<span>{event.date} · {event.place}</span>
				<span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
					{event.label}
				</span>
			</div>
			<h3 className="mt-4 font-bold">{event.title}</h3>
			<p className="mt-1 text-xs text-slate-500">Attending clinician: {event.doctor}</p>
			<p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
				{event.text}
			</p>
			<div className="mt-4 flex flex-wrap gap-2">
				<span className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800">
					Medication: Telmisartan 40 mg
				</span>
				<span className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
					Lab follow-up ordered
				</span>
			</div>
		</article>
	);
}

function CompletedConsultationCard({
	patientName,
	physician,
	note,
}: {
	patientName: string;
	physician: string;
	note: SavedConsultationNote;
}) {
	const recordedDate = note.savedAt
		? new Date(note.savedAt).toLocaleString([], {
				dateStyle: "medium",
				timeStyle: "short",
			})
		: "Date not recorded";

	return (
		<article className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<span className="absolute -left-[31px] top-6 size-4 rounded-full border-4 border-slate-50 bg-emerald-500" />
			<div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-3 text-xs text-slate-500">
				<span>{recordedDate}</span>
				<span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
					Visit completed
				</span>
			</div>
			<h3 className="mt-4 font-bold">Outpatient consultation</h3>
			<p className="mt-1 text-xs text-slate-500">
				{patientName} · Assigned clinician: {physician}
			</p>
			<h4 className="mt-4 text-sm font-semibold">Complaints & symptoms</h4>
			<p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
				{note.complaints || "No consultation note entered."}
			</p>
			<h4 className="mt-4 text-sm font-semibold">Treatment plan & instructions</h4>
			<p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
				{note.plan || "No plan entered."}
			</p>
		</article>
	);
}

function HistoryFilters({
	period,
	onPeriodChange,
	recordType,
	onRecordTypeChange,
}: {
	period: string;
	onPeriodChange: (period: string) => void;
	recordType: string;
	onRecordTypeChange: (recordType: string) => void;
}) {
	return (
		<section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
			<div className="flex flex-wrap gap-2">
				{historyPeriods.map((option) => (
					<button
						key={option}
						type="button"
						aria-pressed={period === option}
						onClick={() => onPeriodChange(option)}
						className={`rounded-lg px-4 py-2 text-sm font-semibold ${
							period === option
								? "bg-sky-800 text-white"
								: "text-slate-600 hover:bg-slate-50"
						}`}
					>
						{option}
					</button>
				))}
			</div>

			<select
				aria-label="Filter record type"
				value={recordType}
				onChange={(event) => onRecordTypeChange(event.target.value)}
				className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
			>
				<option>All record types</option>
				{sampleEvents.map((event) => (
					<option key={event.title}>{event.title}</option>
				))}
			</select>
		</section>
	);
}

function SampleHistorySidebar() {
	return (
		<aside className="space-y-5">
			<section className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
				<div className="flex items-center justify-between">
					<h2 className="font-bold">Allergies & sensitivities</h2>
					<span className="text-xs font-semibold text-rose-700">2 recorded</span>
				</div>
				<div className="mt-4 rounded-xl bg-rose-50 p-4">
					<p className="text-xs font-bold uppercase text-rose-800">Penicillin class · severe</p>
					<p className="mt-2 text-sm leading-5 text-rose-700">
						Causes anaphylaxis and facial swelling. Avoid related medicines.
					</p>
				</div>
				<div className="mt-3 rounded-xl bg-amber-50 p-4">
					<p className="text-xs font-bold uppercase text-amber-800">NSAIDs · moderate</p>
					<p className="mt-2 text-sm leading-5 text-amber-700">
						Gastric intolerance. Confirm alternatives for pain relief.
					</p>
				</div>
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<h2 className="mb-3 font-bold">Ongoing conditions</h2>
				{[
					["High blood pressure", "Managed"],
					["Type 2 diabetes", "Needs review"],
					["High cholesterol", "On medication"],
				].map(([condition, status]) => (
					<div
						key={condition}
						className="flex justify-between gap-2 border-t border-slate-100 py-3 text-sm"
					>
						<span>{condition}</span>
						<span className="text-xs text-slate-500">{status}</span>
					</div>
				))}
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<h2 className="font-bold">Past procedures</h2>
				<p className="mt-3 border-t border-slate-100 pt-3 text-sm">
					Gallbladder removal
					<span className="block text-xs text-slate-500">June 2018</span>
				</p>
				<p className="mt-2 text-sm">
					Tubectomy
					<span className="block text-xs text-slate-500">1998</span>
				</p>
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<h2 className="font-bold">Health trends</h2>
				<p className="mt-3 text-sm text-slate-500">Blood pressure</p>
				<p className="mt-1 text-2xl font-bold text-sky-800">
					138/88 <span className="text-xs font-medium text-slate-500">mmHg</span>
				</p>
				<div className="mt-3 h-2 rounded-full bg-sky-100">
					<div className="h-2 w-3/4 rounded-full bg-sky-600" />
				</div>
				<p className="mt-3 text-xs text-emerald-700">
					Improving with current care plan
				</p>
			</section>
		</aside>
	);
}

export default function HistoryPage() {
	const token = useSelectedPatientToken();
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
	const patient = registrations.find(
		(registration) => String(registration.token) === token,
	);
	const savedNoteValue = useSyncExternalStore(
		subscribeToSavedNotes,
		() => getSavedConsultationNote(token),
		() => null,
	);

	let savedNote: SavedConsultationNote | null = null;
	try {
		savedNote = savedNoteValue
			? (JSON.parse(savedNoteValue) as SavedConsultationNote)
			: null;
	} catch {
		savedNote = null;
	}

	const visitCompleted = Boolean(completedVisits[token]);
	const hasCompletedConsultation = Boolean(savedNote && visitCompleted);
	const [period, setPeriod] = useState("All history");
	const [recordType, setRecordType] = useState("All record types");
	const periodLengthInDays: Record<string, number> = {
		"Past 30 days": 30,
		"Past 6 months": 183,
		"Past year": 365,
	};

	const visibleEvents = (patient ? [] : sampleEvents).filter((event) => {
		const eventDate = Date.parse(event.date.split(" · ")[0]);
		const ageInDays =
			(historyReferenceDate - eventDate) / (1000 * 60 * 60 * 24);
		const matchesPeriod =
			period === "All history" || ageInDays <= periodLengthInDays[period];
		const matchesRecordType =
			recordType === "All record types" || event.title === recordType;

		return matchesPeriod && matchesRecordType;
	});

	const patientSubtitle = patient
		? `${patient.age} yrs · ${patient.gender} · DEMO-${patient.token}${
				patient.bloodGroup ? ` · ${patient.bloodGroup}` : ""
			}`
		: "58 yrs · Female · UHID: HYD-20412 · Blood group O+";

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<CommonNav active="/history" />
			<main className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 md:px-8 md:py-8">
				<section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
					<div className="flex items-center gap-4">
						<div className="grid size-14 place-items-center rounded-2xl bg-sky-100 text-lg font-bold text-sky-800">
							AS
						</div>
						<div>
							<h1 className="text-2xl font-bold">
								{patient?.name ?? "Smt. Ananya Sen"}
							</h1>
							<p className="mt-1 text-sm text-slate-500">{patientSubtitle}</p>
						</div>
					</div>

					<div className="flex flex-wrap gap-2">
						{patient ? (
							<span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
								⚠ Allergy details not recorded
							</span>
						) : (
							<span className="rounded-full bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
								⚠ Severe penicillin allergy
							</span>
						)}
						<span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
							● {patient ? "ABHA status not recorded" : "ABHA linked"}
						</span>
					</div>
				</section>

				{patient && (
					<p className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
						{hasCompletedConsultation
							? "This patient’s completed consultation is saved in this browser. Other clinical records have not been entered."
							: "This demo patient has no completed visit history, allergies, prescriptions, procedures, or health measurements yet. The sample records shown for Ananya Sen are hidden."}
					</p>
				)}

				<HistoryFilters
					period={period}
					onPeriodChange={setPeriod}
					recordType={recordType}
					onRecordTypeChange={setRecordType}
				/>

				<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
					<section>
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-lg font-bold">Longitudinal care history</h2>
							<span className="text-sm text-slate-500">
								{patient
									? hasCompletedConsultation
										? "1 completed visit"
										: "No completed visits saved"
									: `Showing ${visibleEvents.length} sample events`}
							</span>
						</div>

						<div className="space-y-4 border-l-2 border-sky-100 pl-5">
							{patient && savedNote && visitCompleted && (
								<CompletedConsultationCard
									patientName={patient.name}
									physician={patient.physician}
									note={savedNote}
								/>
							)}

							{visibleEvents.map((event) => (
								<SampleHistoryCard key={event.date} event={event} />
							))}

							{visibleEvents.length === 0 && !hasCompletedConsultation && (
								<p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
									{patient
										? "No completed visit history is saved for this demo patient yet."
										: "No sample records match these filters."}
								</p>
							)}
						</div>
					</section>

					{!patient && <SampleHistorySidebar />}
				</div>
			</main>
		</div>
	);
}
