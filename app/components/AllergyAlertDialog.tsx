"use client";

import { useEffect, useRef, useState } from "react";

type AllergyAlertDialogProps = {
  patientName: string;
  knownSampleAllergy: boolean;
  onClose: () => void;
};

type Alternative = {
  name: string;
  detail: string;
};

const alternatives: Alternative[] = [
  { name: "Azithromycin 500 mg", detail: "Macrolide · oral once daily" },
  { name: "Doxycycline 100 mg", detail: "Tetracycline · oral twice daily" },
  { name: "Ciprofloxacin 500 mg", detail: "Fluoroquinolone · oral twice daily" },
];

const overrideReasons = [
  "Desensitization completed",
  "Specialist-supervised protocol",
  "Reaction clarified",
];

type AlternativeOptionsProps = {
  selectedAlternative: string;
  onSelect: (name: string) => void;
};

function AlternativeOptions({
  selectedAlternative,
  onSelect,
}: AlternativeOptionsProps) {
  return (
    <section className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold text-sky-900">Example alternatives</h3>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
          Demo only
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        These examples are not recommendations. A qualified clinician must
        choose appropriate care.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {alternatives.map((alternative) => {
          const isSelected = selectedAlternative === alternative.name;

          return (
            <article
              key={alternative.name}
              className={`rounded-xl border bg-white p-4 ${isSelected
                  ? "border-sky-500 ring-2 ring-sky-100"
                  : "border-slate-200"
                }`}
            >
              <h4 className="font-semibold">{alternative.name}</h4>
              <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">
                {alternative.detail}
              </p>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(alternative.name)}
                className={`mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold ${isSelected
                    ? "bg-sky-800 text-white"
                    : "bg-sky-50 text-sky-800 hover:bg-sky-100"
                  }`}
              >
                {isSelected ? "Selected for preview" : "Select for preview"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

type OverridePreviewProps = {
  selectedReason: string;
  onSelectReason: (reason: string) => void;
  confirmed: boolean;
  onConfirmationChange: (confirmed: boolean) => void;
};

function OverridePreview({
  selectedReason,
  onSelectReason,
  confirmed,
  onConfirmationChange,
}: OverridePreviewProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold">Clinician override preview</h3>
        <span className="text-xs text-slate-500">No audit record is created</span>
      </div>
      <p className="mt-4 text-sm text-slate-600">Choose an example reason:</p>

      <div className="mt-2 flex flex-wrap gap-2">
        {overrideReasons.map((reason) => {
          const isSelected = selectedReason === reason;

          return (
            <button
              key={reason}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectReason(reason)}
              className={`rounded-full border px-3 py-2 text-xs font-medium ${isSelected
                  ? "border-sky-600 bg-sky-100 text-sky-900"
                  : "border-slate-300 bg-white hover:border-sky-400"
                }`}
            >
              {reason}
            </button>
          );
        })}
      </div>

      <textarea
        className="mt-4 min-h-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-sky-500"
        placeholder="Optional demo rationale…"
        aria-label="Optional demo rationale"
      />

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => onConfirmationChange(event.target.checked)}
          className="size-4 accent-sky-700"
        />
        Confirm this is a UI demonstration
      </label>
    </section>
  );
}

export default function AllergyAlertDialog({
  patientName,
  knownSampleAllergy,
  onClose,
}: AllergyAlertDialogProps) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const [selectedAlternative, setSelectedAlternative] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideConfirmed, setOverrideConfirmed] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    closeButton.current?.focus();

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [onClose]);

  function handleAlternativeSelect(name: string) {
    setSelectedAlternative(name);
    setMessage(`${name} selected for this demo preview only.`);
  }

  function handleOverridePreview() {
    setMessage("Override preview accepted. No prescription was sent or saved.");
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  const alertTitle = knownSampleAllergy
    ? "Allergy warning: Penicillin conflict"
    : "Allergy details not recorded";
  const alertDescription = knownSampleAllergy
    ? `${patientName} has a sample-recorded severe penicillin allergy (anaphylaxis). Amoxicillin is part of the penicillin family. Verify allergy information and medication decisions with a qualified clinician.`
    : `No allergy information is saved for ${patientName}. Confirm allergies with the patient before prescribing. The example below is for layout demonstration only.`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 pt-10 backdrop-blur-sm sm:pt-16"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="allergy-alert-title"
        className="w-full max-w-4xl overflow-hidden rounded-3xl border border-rose-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-rose-200 bg-rose-50 p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose-100 text-2xl text-rose-700"
              aria-hidden="true"
            >
              ⚠
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                Patient safety check
              </p>
              <h2
                id="allergy-alert-title"
                className="mt-1 text-xl font-bold text-rose-900 sm:text-2xl"
              >
                {alertTitle}
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-rose-800">
                {alertDescription}
              </p>
            </div>
          </div>

          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            aria-label="Close allergy alert"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-xl text-rose-800 hover:bg-rose-100"
          >
            ×
          </button>
        </header>

        <div className="space-y-5 p-5 sm:p-7">
          <AlternativeOptions
            selectedAlternative={selectedAlternative}
            onSelect={handleAlternativeSelect}
          />
          <OverridePreview
            selectedReason={overrideReason}
            onSelectReason={setOverrideReason}
            confirmed={overrideConfirmed}
            onConfirmationChange={setOverrideConfirmed}
          />
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
          <div className="min-w-48 flex-1">
            <p className="text-xs text-slate-500">
              Demo mode · No medication is ordered.
            </p>
            {message && (
              <p role="status" className="mt-2 text-sm font-medium text-sky-900">
                {message}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!overrideReason || !overrideConfirmed}
              onClick={handleOverridePreview}
              className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Proceed with override preview
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-sky-800 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-900"
            >
              Close alert
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
