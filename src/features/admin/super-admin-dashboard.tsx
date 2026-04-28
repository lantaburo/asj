"use client";

import { formatCurrency } from "@/features/landing-page/landing-page.service";
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Layers, 
  Award, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  Clock,
  BarChart3,
  Calendar
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
};

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  return (
    <div className="britsafe-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ 
        background: `${color}15`, 
        color: color, 
        padding: '12px', 
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ajs-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
          {title}
        </div>
        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ajs-navy)' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

export function SuperAdminDashboard({ data }: { data: any }) {
  const { metrics, pareto, timeSeries } = data;

  return (
    <div style={{ display: 'grid', gap: '30px' }}>
      {/* Row 1: Revenue, Program, Batch */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <MetricCard title="Revenue" value={formatCurrency(metrics.revenue)} icon={<TrendingUp size={24} />} color="#283593" />
        <MetricCard title="Program" value={metrics.programs} icon={<BookOpen size={24} />} color="#5C6BC0" />
        <MetricCard title="Batch" value={metrics.batches} icon={<Layers size={24} />} color="#26A69A" />
      </div>

      {/* Row 2: Total Peserta, Kompeten, Tidak Kompeten */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <MetricCard title="Total Peserta" value={metrics.participants} icon={<Users size={24} />} color="#00ACC1" />
        <MetricCard title="Kompeten" value={metrics.competent} icon={<CheckCircle size={24} />} color="#43A047" />
        <MetricCard title="Tidak Kompeten" value={metrics.notCompetent} icon={<XCircle size={24} />} color="#EF5350" />
      </div>

      {/* Row 3: Instruktur, Asesor, Total JP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <MetricCard title="Instruktur" value={metrics.instructors} icon={<UserCheck size={24} />} color="#7E57C2" />
        <MetricCard title="Asesor" value={metrics.assessors} icon={<UserCheck size={24} />} color="#AB47BC" />
        <MetricCard title="Total JP" value={`${metrics.totalJP} JP`} icon={<Clock size={24} />} color="#FB8C00" />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px' }}>
        <div className="britsafe-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Calendar size={20} style={{ color: 'var(--ajs-navy)' }} />
            <h3 className="britsafe-card__title" style={{ fontSize: '18px', margin: 0 }}>Revenue vs Peserta</h3>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => typeof value === 'number' && value > 1000 ? formatCurrency(value) : value}
                />
                <Legend iconType="circle" />
                <Bar name="Revenue" dataKey="revenue" fill="#283593" radius={[4, 4, 0, 0]} />
                <Bar name="Peserta" dataKey="participants" fill="#00ACC1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="britsafe-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Calendar size={20} style={{ color: 'var(--ajs-teal)' }} />
            <h3 className="britsafe-card__title" style={{ fontSize: '18px', margin: 0 }}>Revenue vs Batch</h3>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Line yAxisId="left" type="monotone" name="Revenue" dataKey="revenue" stroke="#283593" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" name="Batch" dataKey="batchCount" stroke="#26A69A" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Pareto */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
        <div className="britsafe-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <BarChart3 size={20} style={{ color: 'var(--ajs-navy)' }} />
            <h3 className="britsafe-card__title" style={{ fontSize: '18px', margin: 0 }}>Pareto Program (Top Revenue)</h3>
          </div>
          <div style={{ display: 'grid', gap: '16px' }}>
            {pareto.topPrograms.map((p: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--ajs-gray)', borderRadius: '8px' }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{p.title}</div>
                <div style={{ fontWeight: '800', color: 'var(--ajs-navy)' }}>{formatCurrency(p.revenue)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="britsafe-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <BarChart3 size={20} style={{ color: 'var(--ajs-teal)' }} />
            <h3 className="britsafe-card__title" style={{ fontSize: '18px', margin: 0 }}>Pareto Batch (Top Revenue)</h3>
          </div>
          <div style={{ display: 'grid', gap: '16px' }}>
            {pareto.topBatches.map((b: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--ajs-gray)', borderRadius: '8px' }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{b.title}</div>
                <div style={{ fontWeight: '800', color: 'var(--ajs-teal)' }}>{formatCurrency(b.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
