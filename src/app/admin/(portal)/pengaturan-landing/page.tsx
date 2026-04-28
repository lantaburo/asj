import { Metadata } from "next";
import { requireAdminSessionUser } from "@/features/auth/auth.service";

export const metadata: Metadata = {
  title: "Pengaturan Landing Page | AJS Admin",
};

export default async function LandingSettingsPage() {
  await requireAdminSessionUser();

  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ajs-navy)', marginBottom: '8px' }}>
          Pengaturan Landing Page
        </h1>
        <p style={{ color: 'var(--ajs-muted)' }}>
          Kelola konten halaman depan (publik), seperti daftar FAQ, Urutan Mitra, dan teks hero.
        </p>
      </header>

      <div style={{ background: '#FFF3CD', borderLeft: '4px solid #FFC107', padding: '16px', borderRadius: '4px', marginBottom: '32px', color: '#856404' }}>
        <strong>Mode Prototipe:</strong> Tampilan ini adalah antarmuka awal (UI). Untuk membuatnya berfungsi menyimpan data, kita perlu menambahkan tabel `SiteSetting` ke dalam database (Prisma Schema).
      </div>

      <div style={{ display: 'grid', gap: '32px' }}>
        {/* Section: FAQ */}
        <section className="britsafe-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Pertanyaan yang Sering Diajukan (FAQ)</h2>
            <button className="btn btn-outline" type="button">+ Tambah Pertanyaan</button>
          </div>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {[1, 2, 3].map((item) => (
              <div key={item} style={{ padding: '16px', border: '1px solid var(--ajs-border)', borderRadius: '8px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Pertanyaan</label>
                  <input type="text" className="form-input" style={{ width: '100%', padding: '8px', border: '1px solid var(--ajs-border)', borderRadius: '4px' }} defaultValue={item === 1 ? "Apakah sertifikat yang diterbitkan resmi?" : "Bagaimana cara mendaftar pelatihan?"} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Jawaban</label>
                  <textarea className="form-input" rows={2} style={{ width: '100%', padding: '8px', border: '1px solid var(--ajs-border)', borderRadius: '4px' }} defaultValue={item === 1 ? "Ya, semua pelatihan kami berafiliasi resmi." : "Melalui halaman katalog pelatihan."} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="button" style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>Hapus FAQ</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Mitra */}
        <section className="britsafe-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Logo Mitra & Klien</h2>
            <button className="btn btn-outline" type="button">+ Tambah Mitra</button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Nama Perusahaan</th>
                  <th>Ikon (Lucide)</th>
                  <th>Warna Utama (Hover)</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>IMIP Morowali</td>
                  <td>Factory</td>
                  <td><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><div style={{ width: '16px', height: '16px', background: '#C1272D', borderRadius: '4px' }}></div> #C1272D</div></td>
                  <td><button style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Hapus</button></td>
                </tr>
                <tr>
                  <td>Vale Indonesia</td>
                  <td>Mountain</td>
                  <td><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><div style={{ width: '16px', height: '16px', background: '#007D51', borderRadius: '4px' }}></div> #007D51</div></td>
                  <td><button style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Hapus</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button className="btn btn-outline" type="button">Batal</button>
          <button className="btn btn-primary" type="button">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
}
