"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/features/landing-page/landing-page.service";
import { verifyInvoicePayment } from "./invoice.service";
import { CheckCircle2, XCircle, Search, ExternalLink, Image as ImageIcon } from "lucide-react";

type Invoice = any; // Prisma payload from getInvoicesAdmin

export function InvoiceVerificationClient({ initialInvoices, currentUserId }: { initialInvoices: Invoice[], currentUserId: string }) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("PENDING_VERIFICATION");

  const filteredInvoices = invoices.filter(inv => {
    if (filter === "ALL") return true;
    return inv.status === filter;
  });

  const handleVerify = async (invoiceId: string, isRejected: boolean) => {
    if (!confirm(isRejected ? "Yakin ingin MENOLAK bukti transfer ini?" : "Yakin ingin MEMVERIFIKASI (Lunas) tagihan ini?")) return;
    
    setLoadingId(invoiceId);
    try {
      await verifyInvoicePayment(invoiceId, currentUserId, isRejected);
      const updatedStatus = isRejected ? "REJECTED" : "PAID";
      setInvoices(invoices.map(inv => inv.id === invoiceId ? { ...inv, status: updatedStatus } : inv));
      router.refresh();
    } catch (error) {
      alert("Gagal memverifikasi tagihan.");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PAID': return <span style={{ padding: '4px 8px', background: '#E8F5E9', color: '#2E7D32', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>LUNAS</span>;
      case 'PENDING_VERIFICATION': return <span style={{ padding: '4px 8px', background: '#FFF8E1', color: '#FF8F00', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>MENUNGGU VERIFIKASI</span>;
      case 'UNPAID': return <span style={{ padding: '4px 8px', background: '#ECEFF1', color: '#546E7A', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>BELUM DIBAYAR</span>;
      case 'REJECTED': return <span style={{ padding: '4px 8px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>DITOLAK</span>;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'grid', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ajs-navy)', margin: '0 0 8px 0' }}>Verifikasi Pembayaran</h1>
          <p style={{ color: 'var(--ajs-muted)', margin: 0, fontSize: '14px' }}>Verifikasi bukti transfer dari peserta pelatihan.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            className="text-input" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ minWidth: '200px', padding: '10px', borderRadius: '8px' }}
          >
            <option value="PENDING_VERIFICATION">Menunggu Verifikasi</option>
            <option value="PAID">Sudah Lunas</option>
            <option value="UNPAID">Belum Dibayar</option>
            <option value="ALL">Semua Tagihan</option>
          </select>
        </div>
      </div>

      <div className="britsafe-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--ajs-gray)' }}>
              <th style={{ padding: '16px', color: 'var(--ajs-muted)' }}>Tagihan & Peserta</th>
              <th style={{ padding: '16px', color: 'var(--ajs-muted)' }}>Pelatihan</th>
              <th style={{ padding: '16px', color: 'var(--ajs-muted)' }}>Jumlah</th>
              <th style={{ padding: '16px', color: 'var(--ajs-muted)' }}>Status</th>
              <th style={{ padding: '16px', color: 'var(--ajs-muted)', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--ajs-muted)' }}>
                  Tidak ada data tagihan untuk filter ini.
                </td>
              </tr>
            ) : filteredInvoices.map(invoice => (
              <tr key={invoice.id} style={{ borderBottom: '1px solid var(--ajs-gray)' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--ajs-navy)' }}>{invoice.invoiceNumber}</div>
                  <div style={{ fontSize: '14px', color: 'var(--ajs-muted)' }}>{invoice.enrollment.user.fullName}</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: '500' }}>{invoice.enrollment.batch.program.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--ajs-muted)' }}>
                    Batch: {new Date(invoice.enrollment.batch.startDate).toLocaleDateString('id-ID')}
                  </div>
                </td>
                <td style={{ padding: '16px', fontWeight: 'bold', color: 'var(--ajs-navy)' }}>
                  {formatCurrency(invoice.amount)}
                </td>
                <td style={{ padding: '16px' }}>
                  {getStatusBadge(invoice.status)}
                  {invoice.verifiedBy && (
                    <div style={{ fontSize: '11px', color: 'var(--ajs-muted)', marginTop: '4px' }}>
                      Oleh: {invoice.verifiedBy.fullName}
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  {invoice.status === "PENDING_VERIFICATION" ? (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <a href={invoice.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '13px' }} title="Lihat Struk">
                        <ImageIcon size={14} /> Bukti
                      </a>
                      <button 
                        onClick={() => handleVerify(invoice.id, false)} 
                        disabled={loadingId === invoice.id}
                        className="btn btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '13px' }}
                      >
                        <CheckCircle2 size={14} /> Lunas
                      </button>
                      <button 
                        onClick={() => handleVerify(invoice.id, true)} 
                        disabled={loadingId === invoice.id}
                        className="btn" 
                        style={{ background: '#FFEBEE', color: '#D32F2F', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '13px' }}
                      >
                        <XCircle size={14} /> Tolak
                      </button>
                    </div>
                  ) : invoice.paymentProofUrl ? (
                    <a href={invoice.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '13px' }}>
                      <ExternalLink size={14} /> Lihat Bukti
                    </a>
                  ) : (
                    <span style={{ fontSize: '13px', color: 'var(--ajs-muted)' }}>Belum Upload</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
