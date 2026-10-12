"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import CommonNav from "../components/CommonNav";
import {
	getRegistrations,
	getServerRegistrations,
	subscribeToRegistrations,
} from "../lib/registrations";

type Charge = { id: number; description: string; amount: string };

const inputClass =
	"h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

export default function BillingPage() {
	const registrations = useSyncExternalStore(
		subscribeToRegistrations,
		getRegistrations,
		getServerRegistrations,
	);
	const [patientToken, setPatientToken] = useState("");
	const [charges, setCharges] = useState<Charge[]>([]);
	const [description, setDescription] = useState("");
	const [amount, setAmount] = useState("");
	const [message, setMessage] = useState("");
	const patient = registrations.find((item) => String(item.token) === patientToken);
	const total = charges.reduce((sum, charge) => sum + (Number(charge.amount) || 0), 0);

	function addCharge(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const cleanDescription = description.trim();
		const chargeAmount = Number(amount);
		if (!cleanDescription || !Number.isFinite(chargeAmount) || chargeAmount <= 0) {
			setMessage("Enter a charge description and an amount greater than zero.");
			return;
		}
		setCharges((current) => [
			...current,
			{ id: Date.now(), description: cleanDescription, amount: chargeAmount.toFixed(2) },
		]);
		setDescription("");
		setAmount("");
		setMessage("");
	}

	function saveInvoice() {
		if (!patient) {
			setMessage("Choose a saved patient before saving this invoice preview.");
			return;
		}
		try {
			window.localStorage.setItem(
				`apollo-demo-invoice-${patient.token}`,
				JSON.stringify({ patientToken: patient.token, charges, total, savedAt: new Date().toISOString() }),
			);
			setMessage("Invoice preview saved in this browser. No payment was processed.");
		} catch {
			setMessage("Could not save the invoice preview. Check browser storage settings.");
		}
	}

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<CommonNav active="/billing" />
			<main className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-8 md:py-8">
				<header>
					<p className="text-sm font-medium text-sky-700">Patient care portal · Desk services</p>
					<h1 className="mt-1 text-3xl font-bold">Billing</h1>
					<p className="mt-2 text-sm text-slate-500">Prepare a local invoice preview for a registered patient.</p>
				</header>

				<section className="grid gap-6 lg:grid-cols-[1fr_360px]">
					<div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
						<div>
							<label htmlFor="billing-patient" className="mb-2 block text-sm font-semibold text-slate-700">Patient</label>
							<select id="billing-patient" className={inputClass} value={patientToken} onChange={(event) => { setPatientToken(event.target.value); setMessage(""); }}>
								<option value="">Choose a registered patient</option>
								{registrations.map((registration) => (
									<option key={registration.token} value={registration.token}>#{registration.token} · {registration.name}</option>
								))}
							</select>
							{patient && <p className="mt-2 text-xs text-slate-500">{patient.mobile} · {patient.department} · {patient.visitType}</p>}
							{registrations.length === 0 && <p className="mt-2 text-xs text-amber-700">No saved patients yet. Register a patient first.</p>}
						</div>

						<div>
							<h2 className="mb-3 font-bold">Add a charge</h2>
							<form onSubmit={addCharge} className="grid gap-3 sm:grid-cols-[1fr_150px_auto]">
								<label className="sr-only" htmlFor="charge-description">Charge description</label>
								<input id="charge-description" className={inputClass} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. Consultation fee" />
								<label className="sr-only" htmlFor="charge-amount">Amount in rupees</label>
								<input id="charge-amount" className={inputClass} type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount (₹)" />
								<button className="rounded-lg bg-sky-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-900" type="submit">Add charge</button>
							</form>
						</div>

						<div>
							<h2 className="mb-3 font-bold">Invoice items</h2>
							{charges.length === 0 ? <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No charges added yet.</p> : (
								<ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
									{charges.map((charge) => (
										<li key={charge.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
											<span>{charge.description}</span>
											<span className="flex items-center gap-3 font-semibold">₹{Number(charge.amount).toFixed(2)}<button type="button" onClick={() => setCharges((current) => current.filter((item) => item.id !== charge.id))} className="text-xs font-medium text-rose-700 hover:underline" aria-label={`Remove ${charge.description}`}>Remove</button></span>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>

					<aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
						<h2 className="font-bold">Invoice summary</h2>
						<p className="mt-4 text-sm text-slate-500">{patient ? patient.name : "No patient selected"}</p>
						<div className="mt-6 flex justify-between border-t border-slate-100 pt-4 text-lg font-bold"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
						<button type="button" onClick={saveInvoice} disabled={charges.length === 0} className="mt-6 w-full rounded-xl bg-sky-800 px-4 py-3 text-sm font-bold text-white hover:bg-sky-900 disabled:cursor-not-allowed disabled:bg-slate-300">Save invoice preview</button>
						{message && <p className="mt-3 text-sm text-sky-800" role="status">{message}</p>}
						<p className="mt-4 text-xs leading-5 text-slate-500">Demo only: this stores a preview in your browser. It does not collect payment or connect to a billing system.</p>
					</aside>
				</section>
				<Link href="/" className="inline-block text-sm font-semibold text-sky-800 hover:underline">← Back to registration</Link>
			</main>
		</div>
	);
}
