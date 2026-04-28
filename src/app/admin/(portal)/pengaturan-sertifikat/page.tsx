import { fetchCertificateConfig } from "@/features/certificate-config/certificate-config.service";
import { CertificateConfigForm } from "@/features/certificate-config/components/certificate-config-form";
import { getAdminPrograms } from "@/features/programs/program.service";

export const dynamic = "force-dynamic";

export default async function CertificateSettingsPage() {
  const [config, programs] = await Promise.all([
    fetchCertificateConfig(),
    getAdminPrograms()
  ]);

  return (
    <div style={{ display: 'grid', gap: '40px' }}>
      {/* Header */}
      <section className="britsafe-card" style={{ padding: '40px', borderTop: '4px solid var(--ajs-teal)' }}>
        <h1 className="britsafe-card__title" style={{ fontSize: '28px', marginBottom: '16px' }}>
          Pengaturan Sertifikat Internal
        </h1>
        <p className="britsafe-card__copy" style={{ maxWidth: '820px', fontSize: '16px' }}>
          Konfigurasi template PDF, tanda tangan digital, dan passing grade kelulusan.
        </p>
      </section>

      {/* Form Panel */}
      <section className="britsafe-card" style={{ maxWidth: '600px' }}>
        <CertificateConfigForm initialData={config} programs={programs} />
      </section>
    </div>
  );
}
