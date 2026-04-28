import { getInvoicesAdmin } from "@/features/admin/invoice.service";
import { InvoiceVerificationClient } from "@/features/admin/invoice-verification-client";
import { requireAuthenticatedSessionUser } from "@/features/auth/auth.service";

export const dynamic = "force-dynamic";

export default async function InvoiceVerificationPage() {
  const user = await requireAuthenticatedSessionUser();
  const invoices = await getInvoicesAdmin();
  
  return <InvoiceVerificationClient initialInvoices={invoices} currentUserId={user.id} />;
}
