"use client";

import { useState } from "react";
import CommonNav from "../components/CommonNav";

const vitalSigns = [
	{
		label: "Blood pressure",
		value: "138/88",
		unit: "mmHg",
		status: "Mild high",
		statusStyle: "text-amber-700 bg-amber-50",
	},
	{
		label: "Heart rate",
		value: "78",
		unit: "bpm",
		status: "Normal",
		statusStyle: "text-emerald-700 bg-emerald-50",
	},
	{
		label: "Oxygen (SpO₂)",
		value: "98",
		unit: "%",
		status: "Optimal",
		statusStyle: "text-emerald-700 bg-emerald-50",
	},
	{
		label: "Temperature",
		value: "98.6",
		unit: "°F",
		status: "Normal",
		statusStyle: "text-emerald-700 bg-emerald-50",
	},
];

const carePlan = [
	{ label: "Morning vitals & fingerstick blood sugar", status: "Completed" },
	{ label: "Fasting morning lab tests", status: "Sent to lab" },
	{ label: "Echocardiogram heart scan", status: "10:30 AM" },
	{ label: "Dietitian consultation follow-up", status: "After echo" },
];

const bedsideActions = [
	{ icon: "🎙", title: "Voice note", subtitle: "Dictate SOAP" },
	{ icon: "▣", title: "Prescribe", subtitle: "Safe Rx check" },
	{ icon: "⚗", title: "Order tests", subtitle: "Labs & scans" },
	{ icon: "◷", title: "View history", subtitle: "Patient chart" },
];

function VitalCard({
	label,
	value,
	unit,
	status,
	statusStyle,
}: (typeof vitalSigns)[number]) {
	return (
		<article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
			<div className="flex items-start justify-between gap-2">
				<h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
					{label}
				</h3>
				<span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusStyle}`}>
					{status}
				</span>
			</div>
			<p className="mt-4 text-2xl font-bold">
				{value}
				<span className="ml-1 text-xs font-medium text-slate-400">{unit}</span>
			</p>
		</article>
	);
}

export default function BedsidePage() {
	const [completedTasks, setCompletedTasks] = useState([true, true, false, false]);
	const [roundMessage, setRoundMessage] = useState("");
	const completedCount = completedTasks.filter(Boolean).length;

	function toggleCareTask(taskIndex: number) {
		setCompletedTasks((tasks) =>
			tasks.map((isComplete, index) =>
				index === taskIndex ? !isComplete : isComplete,
			),
		);
	}

	function showDemoAction(actionName: string) {
		setRoundMessage(`${actionName} is a demo-only action.`);
	}

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<CommonNav active="/bedside" />
			<main className="mx-auto max-w-3xl space-y-5 px-4 py-5 md:py-8">
				<header className="flex items-center justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
							Ward 4B · Inpatient care
						</p>
						<h1 className="text-xl font-bold">Bedside rounds</h1>
					</div>
					<button
						type="button"
						onClick={() => setRoundMessage("Patient scanning is a demo-only placeholder.")}
						className="rounded-xl bg-sky-800 px-4 py-2.5 text-sm font-semibold text-white"
					>
						▦ Scan
					</button>
				</header>

				<div className="flex justify-between text-xs text-slate-500">
					<span>‹ Bed 401-A · R. Kumar</span>
					<span>Bed 402-B · Ananya Sen ›</span>
				</div>

				<section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
					<div className="flex items-center gap-4">
						<div className="grid size-16 place-items-center rounded-2xl bg-sky-100 text-2xl font-bold text-sky-800">
							AS
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap gap-2">
								<span className="rounded-full bg-sky-800 px-3 py-1 text-xs font-semibold text-white">
									Bed 402-B
								</span>
								<span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
									Day 2 admitted
								</span>
							</div>
							<h2 className="mt-2 text-xl font-bold">Smt. Ananya Sen</h2>
							<p className="text-sm text-slate-500">
								58 yrs · Female · Dr. K. Srinivas
							</p>
						</div>
					</div>

					<div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
						<p className="font-bold text-rose-800">⚠ Allergy alert</p>
						<p className="mt-1 text-sm text-rose-700">
							Severe penicillin allergy (anaphylaxis)
						</p>
					</div>

					<div className="mt-3 flex flex-wrap gap-2">
						<span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
							High fall risk
						</span>
						<span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800">
							Fasting for echo
						</span>
					</div>

					<div className="mt-5 border-t border-slate-100 pt-4">
						<p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
							Active conditions
						</p>
						<div className="flex flex-wrap gap-2">
							{["High blood pressure", "Type 2 diabetes", "Dizziness"].map(
								(condition) => (
									<span
										key={condition}
										className="rounded-full bg-slate-50 px-3 py-2 text-xs"
									>
										{condition}
									</span>
								),
							)}
						</div>
					</div>
				</section>

				<section>
					<div className="mb-3 flex items-center justify-between">
						<h2 className="text-lg font-bold">Current vitals</h2>
						<span className="text-xs text-slate-500">Recorded 07:45 AM</span>
					</div>
					<div className="grid grid-cols-2 gap-3">
						{vitalSigns.map((vital) => (
							<VitalCard key={vital.label} {...vital} />
						))}
					</div>
				</section>

				<section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-lg font-bold">Today’s care plan</h2>
						<span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
							{completedCount} of {carePlan.length} done
						</span>
					</div>

					<div className="mb-4 rounded-2xl border border-sky-100 bg-sky-50 p-4">
						<p className="text-sm font-semibold">IV hydration · Normal saline</p>
						<p className="mt-1 text-xs text-slate-500">
							75 mL/hr · 480 mL remaining
						</p>
					</div>

					{carePlan.map((task, index) => {
						const isComplete = completedTasks[index];
						const statusLabel = isComplete
							? "Completed"
							: task.status === "Completed" || task.status === "Sent to lab"
								? "Mark complete"
								: task.status;

						return (
							<button
								type="button"
								key={task.label}
								aria-pressed={isComplete}
								onClick={() => toggleCareTask(index)}
								className="flex w-full items-center gap-3 border-t border-slate-100 py-4 text-left"
							>
								<span
									className={`grid size-6 place-items-center rounded-full border text-xs ${
										isComplete
											? "border-emerald-500 bg-emerald-50 text-emerald-700"
											: "border-slate-300 text-slate-300"
									}`}
								>
									{isComplete ? "✓" : ""}
								</span>
								<span
									className={`flex-1 text-sm ${
										isComplete ? "text-slate-400 line-through" : "font-medium"
									}`}
								>
									{task.label}
								</span>
								<span className="text-xs text-slate-500">{statusLabel}</span>
							</button>
						);
					})}
				</section>

				<section>
					<h2 className="mb-3 text-lg font-bold">Bedside actions</h2>
					<div className="grid grid-cols-2 gap-3">
						{bedsideActions.map((action) => (
							<button
								type="button"
								key={action.title}
								onClick={() => showDemoAction(action.title)}
								className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-sky-300"
							>
								<span className="text-xl text-sky-800">{action.icon}</span>
								<p className="mt-2 text-sm font-bold">{action.title}</p>
								<p className="text-xs text-slate-500">{action.subtitle}</p>
							</button>
						))}
					</div>
				</section>

				{roundMessage && (
					<p role="status" className="rounded-xl bg-sky-50 p-3 text-sm text-sky-800">
						{roundMessage}
					</p>
				)}

				<button
					type="button"
					onClick={() =>
						setRoundMessage("Round marked complete in this demo. No patient data was saved.")
					}
					className="w-full rounded-2xl bg-sky-800 px-5 py-4 font-bold text-white shadow-sm"
				>
					✓ Mark rounded & next patient
				</button>
			</main>
		</div>
	);
}
