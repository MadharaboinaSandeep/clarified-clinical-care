"use client";

import Link from "next/link";
import { useSelectedPatientToken } from "../lib/patient-navigation";

type NavigationScreen = {
	href: string;
	label: string;
};

const screens: NavigationScreen[] = [
	{ href: "/", label: "Registration" },
	{ href: "/queue", label: "Live queue" },
	{ href: "/consultation", label: "Consultation" },
	{ href: "/history", label: "Patient history" },
	{ href: "/bedside", label: "Bedside rounds" },
	{ href: "/prescribing", label: "Allergy alert" },
];

function getScreenHref(screenHref: string, patientToken: string) {
	if (screenHref === "/prescribing") {
		const patientQuery = patientToken
			? `&token=${encodeURIComponent(patientToken)}`
			: "";
		return `/consultation?showAllergy=1${patientQuery}`;
	}

	if (!patientToken || screenHref === "/") {
		return screenHref;
	}

	return `${screenHref}?token=${encodeURIComponent(patientToken)}`;
}

export default function CommonNav({ active }: { active: string }) {
	const patientToken = useSelectedPatientToken();

	return (
		<nav
			aria-label="Project screens"
			className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur md:px-8"
		>
			<div className="mx-auto flex max-w-[1600px] gap-2 overflow-x-auto">
				{screens.map((screen) => (
					<Link
						key={screen.href}
						href={getScreenHref(screen.href, patientToken)}
						className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition ${
							active === screen.href
								? "bg-sky-800 text-white"
								: "text-slate-600 hover:bg-slate-100"
						}`}
					>
						{screen.label}
					</Link>
				))}
			</div>
		</nav>
	);
}
