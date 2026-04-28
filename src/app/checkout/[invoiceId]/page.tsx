import { getInvoiceDetails } from "@/features/checkout/checkout.service";
import { getPaymentSettings } from "@/features/admin/payment-settings.service";
import { CheckoutClient } from "@/features/checkout/checkout-client";
import { LandingHeader } from "@/features/landing-page/landing-header";
import { requireAuthenticatedSessionUser } from "@/features/auth/auth.service";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  const user = await requireAuthenticatedSessionUser();
  const invoice = await getInvoiceDetails(invoiceId);

  if (invoice.enrollment.userId !== user.id) {
    redirect("/masuk");
  }

  const paymentSettings = await getPaymentSettings();
  const activeSettings = paymentSettings.filter((s: any) => s.isActive);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8F9FA' }}>
      <LandingHeader />
      <div style={{ flex: 1, padding: '100px 0' }}>
        <CheckoutClient invoice={invoice} paymentSettings={activeSettings} />
      </div>
    </div>
  );
}
