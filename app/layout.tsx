import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Outpatient Registration | Apollo Health Network",
  description: "Patient registration desk for Apollo Health Network.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
