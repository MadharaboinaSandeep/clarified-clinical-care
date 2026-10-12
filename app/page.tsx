"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import CommonNav from "./components/CommonNav";
import {
  getRegistrations,
  getServerRegistrations,
  saveRegistration,
  subscribeToRegistrations,
  type SavedRegistration,
} from "./lib/registrations";

const navItems = [
  { icon: "✚", label: "New registration", href: "/", active: true },
  { icon: "⌕", label: "Patient search", href: "/queue#patient-search" },
  { icon: "◷", label: "Doctor queues", href: "/queue#doctor-queues", count: "28" },
  { icon: "✳", label: "Emergency STAT", href: "/queue?filter=Emergency#emergency-filter" },
  { icon: "▣", label: "Billing", href: "/billing" },
];

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

function getAge(birthDate: string) {
  if (!birthDate) return 0;
  const today = new Date();
  const date = new Date(`${birthDate}T00:00:00`);
  let age = today.getFullYear() - date.getFullYear();
  const monthDifference = today.getMonth() - date.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < date.getDate())
  ) {
    age -= 1;
  }
  return age;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const registrations = useSyncExternalStore(
    subscribeToRegistrations,
    getRegistrations,
    getServerRegistrations,
  );
  const [visitType, setVisitType] = useState("New visit");
  const [isEmergency, setIsEmergency] = useState(false);
  const [birthDateDraft, setBirthDateDraft] = useState("");
  const [mobileDraft, setMobileDraft] = useState("");
  const [patientNameDraft, setPatientNameDraft] = useState("");
  const savedRegistration = registrations[0] ?? null;

  const nextToken = Math.max(19, ...registrations.map((item) => item.token + 1));
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-sky-700 text-xl font-bold text-white">
            ✚
          </div>
          <div>
            <p className="font-bold leading-tight">Apollo Health Network</p>
            <p className="text-xs text-slate-500">
              Outpatient care · Hyderabad
            </p>
          </div>
          <span className="ml-4 hidden border-l border-slate-200 pl-5 text-sm text-slate-500 md:block">
            Reception desk
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:flex">
            <span className="size-2 rounded-full bg-emerald-500" /> System ready
          </span>
          <div className="text-right">
            <p className="text-sm font-semibold">Sister Priya R.</p>
            <p className="text-xs text-slate-500">Registration desk</p>
          </div>
          <div className="grid size-10 place-items-center rounded-full bg-sky-100 text-sm font-bold text-sky-800">
            PR
          </div>
        </div>
      </header>
      <CommonNav active="/" />

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 lg:block">
          <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Desk services
          </p>
          <p className="mb-5 px-3 text-sm font-semibold text-slate-700">
            Patient care portal
          </p>
          <nav
            aria-label="Desk services"
            className="space-y-1"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${item.active ? "bg-sky-50 font-semibold text-sky-800 ring-1 ring-sky-100" : "text-slate-600"}`}
              >
                <span
                  className="w-5 text-center text-lg"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.count && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                    {item.count}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="mt-8 rounded-xl bg-sky-50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              Today at the desk
            </p>
            <p className="mt-2 text-2xl font-bold text-sky-800">
              42 <span className="text-sm font-medium">registered</span>
            </p>
            <div className="mt-3 h-2 rounded-full bg-sky-100">
              <div className="h-2 w-2/3 rounded-full bg-sky-600" />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-sm font-medium text-sky-700">
                Patient care portal{" "}
                <span className="px-1 text-slate-300">/</span> New registration
              </p>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Outpatient registration
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Register a walk-in or appointment, assign a clinic, and prepare
                a visit token.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMessage("QR scanning is a demo-only placeholder.")}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Scan ABHA QR
            </button>
          </div>

          <form
            className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const birthDate = String(formData.get("birthDate") ?? "");
              const patientName = String(formData.get("patientName") ?? "").trim();
              const today = new Date();
              const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
              if (!patientName) {
                setMessage("Enter the patient's name using at least one letter.");
                return;
              }
              if (birthDate > todayString) {
                setMessage("Date of birth cannot be in the future.");
                return;
              }
              const emergency = formData.get("isEmergency") === "on";
              const registration: SavedRegistration = {
                token: nextToken,
                name: patientName,
                birthDate,
                age: getAge(birthDate),
                gender: String(formData.get("gender") ?? ""),
                mobile: String(formData.get("mobile") ?? ""),
                bloodGroup: String(formData.get("bloodGroup") ?? "Not provided"),
                address: String(formData.get("address") ?? "Not provided"),
                department: String(formData.get("department") ?? ""),
                physician: String(formData.get("physician") ?? ""),
                visitType,
                createdAt: new Date().toISOString(),
                isEmergency: emergency,
                emergencyReason: String(formData.get("emergencyReason") ?? "").trim(),
              };
              try {
                saveRegistration(registration);
              } catch {
                setMessage("Could not save this demo registration. Check browser storage settings and try again.");
                return;
              }
              setMessage(
                `${registration.name} was saved on this browser. The form has been cleared.`,
              );
              event.currentTarget.reset();
              setVisitType("New visit");
              setIsEmergency(false);
              setBirthDateDraft("");
              setMobileDraft("");
              setPatientNameDraft("");
            }}
          >
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-sky-50 font-bold text-sky-800">
                      1
                    </span>
                    <h2 className="text-lg font-bold">
                      Patient identity & contact
                    </h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    ABHA link available
                  </span>
                </div>

                <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
                  <Field
                    label="Full legal name *"
                    className="md:col-span-1"
                  >
                    <input
                      className={inputClass}
                      placeholder="Enter patient name"
                      name="patientName"
                      value={patientNameDraft}
                      onChange={(event) => setPatientNameDraft(event.target.value.replace(/[^\p{L}\p{M} .'-]/gu, ""))}
                      aria-describedby="patient-name-help"
                      required
                    />
                    <p id="patient-name-help" className="mt-1.5 text-xs text-slate-500">Use letters, spaces, apostrophes, periods, or hyphens.</p>
                  </Field>
                  <div className="grid grid-cols-[1fr_76px] gap-3">
                    <Field label="Date of birth *">
                      <input
                        className={inputClass}
                        type="date"
                        name="birthDate"
                        value={birthDateDraft}
                        onChange={(event) => setBirthDateDraft(event.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Age">
                      <div className="flex h-11 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
                        {birthDateDraft ? `${getAge(birthDateDraft)} yrs` : "— yrs"}
                      </div>
                    </Field>
                  </div>
                  <Field label="Gender *">
                    <select
                      className={inputClass}
                      defaultValue=""
                      name="gender"
                      required
                    >
                      <option
                        value=""
                        disabled
                      >
                        Select gender
                      </option>
                      <option>Female</option>
                      <option>Male</option>
                      <option>Other</option>
                    </select>
                  </Field>
                  <Field label="Mobile number *">
                    <input
                      className={inputClass}
                      type="tel"
                      name="mobile"
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      minLength={10}
                      maxLength={10}
                      value={mobileDraft}
                      onChange={(event) => setMobileDraft(event.target.value.replace(/\D/g, "").slice(0, 10))}
                      aria-describedby="mobile-help"
                      title="Enter exactly 10 digits"
                      required
                    />
                    <p id="mobile-help" className="mt-1.5 text-xs text-slate-500">Enter exactly 10 digits.</p>
                  </Field>
                  <Field label="Blood group">
                    <select
                      className={inputClass}
                      defaultValue=""
                      name="bloodGroup"
                    >
                      <option
                        value=""
                        disabled
                      >
                        Select blood group
                      </option>
                      <option>A positive (A+)</option>
                      <option>B positive (B+)</option>
                      <option>O positive (O+)</option>
                      <option>Other / unknown</option>
                    </select>
                  </Field>
                  <Field
                    label="Residential address"
                    className="md:col-span-2"
                  >
                    <input
                      className={inputClass}
                      placeholder="Flat, street, city, postal code"
                      name="address"
                    />
                  </Field>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50/70 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-white text-xl text-sky-700">
                      ✚
                    </span>
                    <div>
                      <p className="text-sm font-semibold">
                        Ayushman Bharat Health Account
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Link a digital health ID if the patient has one.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMessage("ABHA linking is a demo-only placeholder.")}
                    className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
                  >
                    Link ABHA
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="grid size-9 place-items-center rounded-xl bg-sky-50 font-bold text-sky-800">
                    2
                  </span>
                  <div>
                    <h2 className="text-lg font-bold">Visit & department</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Choose where the patient should be seen.
                    </p>
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Visiting department *">
                    <select
                      className={inputClass}
                      defaultValue=""
                      name="department"
                      required
                    >
                      <option
                        value=""
                        disabled
                      >
                        Select department
                      </option>
                      <option>General internal medicine</option>
                      <option>Cardiology</option>
                      <option>Orthopedics</option>
                      <option>Pediatrics</option>
                    </select>
                  </Field>
                  <Field label="Assigned physician & room *">
                    <select
                      className={inputClass}
                      defaultValue=""
                      name="physician"
                      required
                    >
                      <option
                        value=""
                        disabled
                      >
                        Select physician
                      </option>
                      <option>Dr. K. Srinivas · Room 104</option>
                      <option>Dr. A. Bharadwaj · Room 101</option>
                    </select>
                  </Field>
                  <fieldset className="md:col-span-2">
                    <legend className="mb-2 text-sm font-semibold text-slate-700">
                      Visit type
                    </legend>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        aria-pressed={visitType === "New visit"}
                        onClick={() => setVisitType("New visit")}
                        className={`rounded-lg border px-3 py-3 text-sm font-semibold ${visitType === "New visit" ? "border-sky-600 bg-sky-50 text-sky-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                      >
                        New visit
                      </button>
                      <button
                        type="button"
                        aria-pressed={visitType === "Follow-up"}
                        onClick={() => setVisitType("Follow-up")}
                        className={`rounded-lg border px-3 py-3 text-sm font-medium ${visitType === "Follow-up" ? "border-sky-600 bg-sky-50 text-sky-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                      >
                        Follow-up
                      </button>
                      <button
                        type="button"
                        aria-pressed={visitType === "Health check"}
                        onClick={() => setVisitType("Health check")}
                        className={`rounded-lg border px-3 py-3 text-sm font-medium ${visitType === "Health check" ? "border-sky-600 bg-sky-50 text-sky-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                      >
                        Health check
                      </button>
                    </div>
                  </fieldset>
                  <div className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        className="mt-1 size-4 accent-rose-600"
                        type="checkbox"
                        name="isEmergency"
                        checked={isEmergency}
                        onChange={(event) => setIsEmergency(event.target.checked)}
                      />
                      <span>
                        <span className="block text-sm font-bold text-rose-800">Emergency · needs immediate triage</span>
                        <span className="mt-1 block text-xs leading-5 text-rose-700">Mark only when urgent clinical attention is needed. The queue will flag this patient for staff review.</span>
                      </span>
                    </label>
                    {isEmergency && (
                      <Field label="Emergency reason (optional)">
                        <input className={inputClass} name="emergencyReason" placeholder="Brief reason for urgent triage" />
                      </Field>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">Recent registrations</h2>
                    <p className="mt-1 text-xs text-slate-500">Latest patients saved on this browser.</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{registrations.length}</span>
                </div>
                {registrations.length ? (
                  <div className="divide-y divide-slate-100">
                    {registrations.slice(0, 3).map((registration) => (
                      <Link key={registration.token} href={`/consultation?token=${registration.token}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:text-sky-800">
                        <span className="min-w-0"><span className="block truncate text-sm font-semibold">{registration.name}</span><span className="mt-1 block text-xs text-slate-500">#{registration.token} · {registration.department}</span></span>
                        <span className="shrink-0 text-xs font-semibold text-sky-700">Open →</span>
                      </Link>
                    ))}
                  </div>
                ) : <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Saved patients will appear here.</p>}
              </section>
            </div>

            <aside className="space-y-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="font-bold">Visit token preview</h2>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {savedRegistration ? "Saved on this browser" : "Draft"}
                  </span>
                </div>
                <div className="my-5 rounded-2xl bg-sky-50 p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    OPD consultation
                  </p>
                  <p className="my-1 text-5xl font-bold tracking-tight text-sky-800">
                    {savedRegistration ? `#${savedRegistration.token}` : "—"}
                  </p>
                  <p className="text-sm font-semibold">
                    {savedRegistration
                      ? savedRegistration.name
                      : "Patient name pending"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {savedRegistration
                      ? `${savedRegistration.age} yrs · ${savedRegistration.visitType}`
                      : "Complete the form to preview queue details."}
                  </p>
                  {savedRegistration && (
                    <div className="mt-4 space-y-1 border-t border-sky-100 pt-3 text-xs text-slate-600">
                      <p>{savedRegistration.gender} · {savedRegistration.bloodGroup}</p>
                      <p>{savedRegistration.mobile}</p>
                      <p>{savedRegistration.department}</p>
                      <p>{savedRegistration.physician}</p>
                      <p>{savedRegistration.address}</p>
                      {savedRegistration.isEmergency && <p className="font-semibold text-rose-700">Emergency: {savedRegistration.emergencyReason || "Immediate triage requested"}</p>}
                    </div>
                  )}
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2.5">
                    <dt className="text-slate-500">UHID</dt>
                    <dd className="font-semibold">
                      {savedRegistration ? `DEMO-${savedRegistration.token}` : "Generated after save"}
                    </dd>
                  </div>
                  <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2.5">
                    <dt className="text-slate-500">Visit type</dt>
                    <dd className="font-semibold">
                      {savedRegistration ? savedRegistration.visitType : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2.5">
                    <dt className="text-slate-500">Billing</dt>
                    <dd className="font-semibold">To be confirmed</dd>
                  </div>
                </dl>
                <p className="mt-3 text-center text-xs text-slate-400">
                  You can review details before issuing a token.
                </p>
              </section>
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Front-desk guidance
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Mark urgent cases for triage. Senior patients and patients
                  needing assistance can receive priority support.
                </p>
              </div>
            </aside>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex md:items-center md:justify-between md:gap-6 md:px-6 xl:col-span-2" aria-label="Registration actions">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Registration actions</h2>
                <p className="mt-1 text-xs text-slate-500">Review the details, then save the patient or clear the form.</p>
                {message && <p className="mt-2 text-sm text-sky-800" role="status">{message}</p>}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 md:mt-0 md:min-w-[320px]">
                <button type="reset" onClick={() => { setVisitType("New visit"); setIsEmergency(false); setBirthDateDraft(""); setMobileDraft(""); setPatientNameDraft(""); setMessage(""); }} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Reset form</button>
                <button type="submit" className="rounded-xl bg-sky-800 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-sky-900">Save registration</button>
              </div>
            </section>
          </form>
        </main>
      </div>
    </div>
  );
}
