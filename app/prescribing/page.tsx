import { redirect } from "next/navigation";

export default async function PrescribingPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const params = new URLSearchParams({ showAllergy: "1" });
  if (token) params.set("token", token);
  redirect(`/consultation?${params.toString()}`);
}
