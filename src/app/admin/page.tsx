import Link from "next/link";
import {
  canManageMasterData,
  getCurrentSessionUser
} from "@/features/auth/auth.service";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentSessionUser();
  const canOpenMasterData = currentUser
    ? canManageMasterData(currentUser.role)
    : false;

  return (
    <>
      <section style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', marginBottom: '30px' }}>
        <article className="britsafe-card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <span className="britsafe-card__category">Kontrol Utama</span>
            <h2 className="britsafe-card__title" style={{ fontSize: '24px', margin: '8px 0 16px' }}>
              Pilih jalur kerja berdasarkan prioritas operasional hari ini.
            </h2>
            <p className="britsafe-card__copy" style={{ fontSize: '15px' }}>
              Dashboard ini dirancang sebagai titik komando singkat: master data
              di satu sisi, sertifikasi di sisi lain, dengan alur yang jelas.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <article style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--ajs-gray)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ fontSize: '24px', color: 'var(--ajs-navy)', opacity: 0.3 }}>01</strong>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>Pastikan program, batch, classroom, dan session sudah sinkron.</div>
            </article>
            <article style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--ajs-gray)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ fontSize: '24px', color: 'var(--ajs-navy)', opacity: 0.3 }}>02</strong>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>Tinjau progress enrollment, assessment, dan logbook praktik.</div>
            </article>
            <article style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--ajs-gray)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ fontSize: '24px', color: 'var(--ajs-navy)', opacity: 0.3 }}>03</strong>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>Finalisasi verifikasi agar sertifikat siap diterbitkan.</div>
            </article>
          </div>
        </article>

        <article className="britsafe-card" style={{ padding: '32px' }}>
          <span className="britsafe-card__category">Session Aktif</span>
          <div style={{ display: 'grid', gap: '16px', marginTop: '20px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--ajs-border)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--ajs-muted)' }}>Nama operator</span>
              <strong style={{ fontSize: '14px', color: 'var(--ajs-text)' }}>{currentUser?.fullName ?? "-"}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--ajs-border)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--ajs-muted)' }}>Email login</span>
              <strong style={{ fontSize: '14px', color: 'var(--ajs-text)' }}>{currentUser?.email ?? "-"}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--ajs-border)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--ajs-muted)' }}>Role aktif</span>
              <strong style={{ fontSize: '14px', color: 'var(--ajs-text)' }}>{currentUser?.role ?? "-"}</strong>
            </div>
          </div>
          <div style={{ background: 'rgba(0, 166, 81, 0.1)', color: 'var(--ajs-green)', padding: '16px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '600', lineHeight: 1.5 }}>
            {canOpenMasterData
              ? "Role Anda memiliki akses ke seluruh area kerja internal."
              : "Role Anda difokuskan ke area sertifikasi dan verifikasi internal."}
          </div>
        </article>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        <article className="britsafe-card" style={{ padding: '32px', opacity: canOpenMasterData ? 1 : 0.6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <span style={{ background: 'var(--ajs-navy)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>SUPER_ADMIN / ADMIN</span>
            <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--ajs-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              <span>Program</span> • <span>Batch</span>
            </div>
          </div>
          <div>
            <h3 className="britsafe-card__title" style={{ fontSize: '22px' }}>Master Data</h3>
            <p className="britsafe-card__copy" style={{ fontSize: '14px', marginBottom: '32px' }}>
              Pusat kendali untuk menjaga data pelatihan tetap rapi, konsisten,
              dan siap dipakai oleh landing page maupun modul operasional lain.
            </p>
          </div>
          {canOpenMasterData ? (
            <Link className="cta-primary" href="/admin/master-data" style={{ textAlign: 'center', marginTop: 'auto' }}>
              Buka Master Data
            </Link>
          ) : (
            <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginTop: 'auto' }}>
              Area ini dikunci untuk role Anda. Hubungi ADMIN untuk akses.
            </div>
          )}
        </article>

        <article className="britsafe-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <span style={{ background: 'var(--ajs-orange)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>Semua Role</span>
            <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--ajs-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              <span>Assessment</span> • <span>Logbook</span>
            </div>
          </div>
          <div>
            <h3 className="britsafe-card__title" style={{ fontSize: '22px' }}>Sertifikasi & Verifikasi</h3>
            <p className="britsafe-card__copy" style={{ fontSize: '14px', marginBottom: '32px' }}>
              Monitor progress peserta dari enrollment sampai verifikasi akhir,
              lengkap dengan log praktik dan kesiapan nomor sertifikat.
            </p>
          </div>
          <Link className="cta-primary" href="/admin/sertifikasi" style={{ textAlign: 'center', marginTop: 'auto' }}>
            Buka Sertifikasi
          </Link>
        </article>
      </section>
    </>
  );
}
