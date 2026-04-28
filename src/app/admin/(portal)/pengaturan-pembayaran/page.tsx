import { getPaymentSettings } from "@/features/admin/payment-settings.service";
import { PaymentSettingsClient } from "@/features/admin/payment-settings-client";

export const dynamic = "force-dynamic";

export default async function PaymentSettingsPage() {
  const settings = await getPaymentSettings();
  
  return <PaymentSettingsClient initialSettings={settings} />;
}
