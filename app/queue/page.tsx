"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import CommonNav from "../components/CommonNav";
import {
	getCompletedVisits,
	getRegistrations,
	getServerCompletedVisits,
	getServerRegistrations,
	subscribeToRegistrations,
} from "../lib/registrations";

function subscribeToQueueFilter(callback: () => void) {
	window.addEventListener("popstate", callback);
	return () => window.removeEventListener("popstate", callback);
}

function getQueueFilterFromUrl() {
	const filter = new URLSearchParams(window.location.search).get("filter");
	return filter === "Emergency" || filter === "Waiting" ? filter : "All patients";
}

function getServerQueueFilter() {
	return "All patients";
}

type QueuePatient = {
	token: string;
	name: string;
	details: string;
	arrival: string;
	priority: string;
	doctor: string;
	status: string;
	tone: "blue" | "red" | "green" | "slate";
};

type SummaryCardData = {
	title: string;
	value: string;
	detail: string;
	icon: string;
};

const samplePatients: QueuePatient[] = [
	{
		token: "#14",
		name: "Ananya Sen",
		details: "58 yrs · Female · HYD-20412",
		arrival: "10:04 AM",
		priority: "Fast-track",
		doctor: "Dr. K. Srinivas · Room 104",
		status: "Now calling",
		tone: "blue",
	},
	{
		token: "#15",
		name: "Venkat Ramanan",
		details: "Acute chest pain · BP 168/104",
		arrival: "10:28 AM",
		priority: "Emergency",
		doctor: "Dr. A. Bharadwaj · Room 101",
		status: "Next direct",
		tone: "red",
	},
	{
		token: "#12",
		name: "Rajeshwar Patil",
		details: "42 yrs · Male · HYD-11984",
		arrival: "09:50 AM",
		priority: "Routine",
		doctor: "Dr. V. Rao · Room 102",
		status: "With doctor",
		tone: "green",
	},
	{
		token: "#16",
		name: "Prof. K. Venkatesan",
		details: "79 yrs · Wheelchair assisted",
		arrival: "10:12 AM",
		priority: "Senior citizen",
		doctor: "Dr. K. Srinivas · Room 104",
		status: "Waiting · #2",
		tone: "slate",
	},
	{
		token: "#17",
		name: "Deepika Padmanabhan",
		details: "29 yrs · Trimester 3 checkup",
		arrival: "10:15 AM",
		priority: "Expectant mother",
		doctor: "Dr. P. Iyer · Room 108",
		status: "Waiting · #3",
		tone: "slate",
	},
	{
		token: "#18",
		name: "Syed Mohammed Ali",
		details: "36 yrs · Mild fever",
		arrival: "10:19 AM",
		priority: "Routine",
		doctor: "Dr. K. Srinivas · Room 104",
		status: "Waiting · #4",
		tone: "slate",
	},
];

const toneClasses: Record<QueuePatient["tone"], string> = {
	blue: "bg-sky-100 text-sky-800",
	red: "bg-rose-100 text-rose-700",
	green: "bg-emerald-100 text-emerald-700",
	slate: "bg-slate-100 text-slate-700",
};

function SummaryCard({ title, value, detail, icon }: SummaryCardData) {
	return (
		<article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<div className="flex items-start justify-between">
				<p className="text-sm font-semibold text-slate-500">{title}</p>
				<span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-lg text-sky-800">
					{icon}
				</span>
			</div>
			<p className="mt-3 text-3xl font-bold">{value}</p>
			<p className="mt-1 text-sm text-slate-500">{detail}</p>
		</article>
	);
}

function PatientQueueTable({
	patients,
	savedRegistrationCount,
}: {
	patients: QueuePatient[];
	savedRegistrationCount: number;
}) {
	return (
		<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[1050px] text-left text-sm">
					<thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
						<tr>
							{[
								"Token",
								"Patient",
								"Arrival",
								"Priority",
								"Assigned doctor & room",
								"Status",
								"Action",
							].map((heading) => (
								<th key={heading} className="px-5 py-4 font-semibold">
									{heading}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{patients.map((patient) => (
							<tr key={patient.token} className="hover:bg-slate-50">
								<td className="px-5 py-4">
									<span
										className={`rounded-lg px-3 py-2 font-bold ${toneClasses[patient.tone]}`}
									>
										{patient.token}
									</span>
								</td>
								<td className="px-5 py-4">
									<p className="font-semibold">{patient.name}</p>
									<p className="mt-1 text-xs text-slate-500">
										{patient.details}
									</p>
								</td>
								<td className="px-5 py-4">{patient.arrival}</td>
								<td className="px-5 py-4">
									<span
										className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[patient.tone]}`}
									>
										{patient.priority}
									</span>
								</td>
								<td className="px-5 py-4">{patient.doctor}</td>
								<td className="px-5 py-4">
									<span
										className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[patient.tone]}`}
									>
										{patient.status}
									</span>
								</td>
								<td className="px-5 py-4">
									<Link
										href={`/consultation?token=${encodeURIComponent(patient.token.replace("#", ""))}`}
										className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
									>
										Open visit
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="flex justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
				<span>
					Showing {patients.length} patients ({savedRegistrationCount} saved on this
					browser)
				</span>
				<span>Demo queue · stored locally</span>
			</div>
		</section>
	);
}

export default function QueuePage() {
	const filter = useSyncExternalStore(
		subscribeToQueueFilter,
		getQueueFilterFromUrl,
		getServerQueueFilter,
	);
	const [query, setQuery] = useState("");
	const [room, setRoom] = useState("All rooms");
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

	function selectFilter(nextFilter: string) {
		const url = new URL(window.location.href);
		if (nextFilter === "All patients") url.searchParams.delete("filter");
		else url.searchParams.set("filter", nextFilter);
		window.history.replaceState(null, "", url);
		window.dispatchEvent(new PopStateEvent("popstate"));
	}

	const newPatientRows: QueuePatient[] = registrations.map((registration) => {
		const isCompleted = Boolean(completedVisits[String(registration.token)]);
		const isEmergency = Boolean(registration.isEmergency);
		const tone = isCompleted ? "green" : isEmergency ? "red" : "slate";

		return {
			token: `#${registration.token}`,
			name: registration.name,
			details: `${registration.age} yrs · ${registration.gender} · ${registration.mobile}${
				isEmergency
					? ` · Emergency: ${registration.emergencyReason || "Immediate triage"}`
					: ""
			}`,
			arrival: new Date(registration.createdAt).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
			priority: isEmergency ? "Emergency" : "Routine",
			doctor: registration.physician,
			status: isCompleted
				? "Completed"
				: isEmergency
					? "Next direct"
					: "Waiting · new",
			tone,
		};
	});

	const sampleQueueRows = samplePatients.map((patient) => {
		const patientToken = patient.token.replace("#", "");
		const wasCompleted = Boolean(completedVisits[patientToken]);

		return wasCompleted
			? { ...patient, status: "Completed", tone: "green" as const }
			: patient;
	});
	const allPatients = [...newPatientRows, ...sampleQueueRows];

	const visiblePatients = allPatients.filter((patient) => {
		const searchText = `${patient.token} ${patient.name} ${patient.details}`.toLowerCase();	
		const matchesSearch = searchText.includes(query.toLowerCase());
		const matchesRoom = room === "All rooms" || patient.doctor.includes(room);
		const matchesFilter =
			filter === "All patients" ||
			(filter === "Waiting" &&
				(patient.status.startsWith("Waiting") || patient.status === "Next direct")) ||
			(filter === "Emergency" && patient.priority === "Emergency");

		return matchesSearch && matchesRoom && matchesFilter;
	});

	const waitingCount = allPatients.filter(
		(patient) =>
			patient.status.startsWith("Waiting") || patient.status === "Next direct",
	).length;
	const withDoctorCount = allPatients.filter(
		(patient) => patient.status === "With doctor" || patient.status === "Now calling",
	).length;
	const completedCount = allPatients.filter(
		(patient) => patient.status === "Completed",
	).length;

	const summaryCards: SummaryCardData[] = [
		{
			title: "Total patients",
			value: String(allPatients.length),
			detail: `${registrations.length} saved registration${registrations.length === 1 ? "" : "s"}`,
			icon: "👥",
		},
		{
			title: "Waiting right now",
			value: String(waitingCount),
			detail: "Includes new and emergency arrivals",
			icon: "⌛",
		},
		{
			title: "With doctor",
			value: String(withDoctorCount),
			detail: "Being called or seen now",
			icon: "＋",
		},
		{
			title: "Done for today",
			value: String(completedCount),
			detail: "Visits marked complete",
			icon: "✓",
		},
	];

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<CommonNav active="/queue" />
			<main className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 md:px-8 md:py-8">
				<header className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="text-sm font-medium text-sky-700">
							Apollo Health Network · OPD Wing B
						</p>
						<h1 className="mt-1 text-3xl font-bold">Live patient queue</h1>
						<p className="mt-2 text-sm text-slate-500">
							Track arrivals and help each patient reach the right room.
						</p>
					</div>
					<span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
						● Queue live & active
					</span>
				</header>

				<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{summaryCards.map((card) => (
						<SummaryCard key={card.title} {...card} />
					))}
				</section>

				<section id="doctor-queues" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="flex gap-2">
							{["All patients", "Waiting", "Emergency"].map((option) => (
								<button
									key={option}
									type="button"
									id={option === "Emergency" ? "emergency-filter" : undefined}
									aria-pressed={filter === option}
									onClick={() => selectFilter(option)}
									className={`rounded-lg px-4 py-2 text-sm font-semibold ${
										filter === option
										? "bg-sky-800 text-white"
										: "text-slate-600 hover:bg-slate-50"
									}`}
								>
									{option}
								</button>
							))}
						</div>

						<div className="flex flex-wrap gap-2">
							<input
								id="patient-search"
								aria-label="Search patients"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Search name or token…"
								className="h-10 w-56 rounded-lg border border-slate-200 px-3 text-sm"
							/>
							<select
								aria-label="Filter by room"
								value={room}
								onChange={(event) => setRoom(event.target.value)}
								className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
							>
								<option>All rooms</option>
								<option>Room 101</option>
								<option>Room 102</option>
								<option>Room 104</option>
								<option>Room 108</option>
							</select>
						</div>
					</div>
				</section>

				<PatientQueueTable
					patients={visiblePatients}
					savedRegistrationCount={registrations.length}
				/>
			</main>
		</div>
	);
}
