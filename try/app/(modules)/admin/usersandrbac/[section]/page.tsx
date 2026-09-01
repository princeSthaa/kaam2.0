import { notFound } from "next/navigation";
import EmployeesAndRbacPage from "../page";

const VALID_SECTIONS = new Set([
  "employees", "roles", "departments", "permissions", "pages", "page-access", "page-permissions", "role-permissions", "access-control",
]);

export default async function RbacSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!VALID_SECTIONS.has(section)) notFound();
  return <EmployeesAndRbacPage />;
}
