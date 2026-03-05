import { useState, useEffect } from 'react';
import { reports as reportsApi, organization } from '../api/client';
import styles from './Members.module.css';

export function Reports() {
  const [churchId, setChurchId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [churches, setChurches] = useState<any[]>([]);
  const [report, setReport] = useState<{ items: any[]; totalAmount: number; count: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    organization.churches.list().then(setChurches).catch(() => {});
  }, []);

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await reportsApi.tithes({
        churchId: churchId || undefined,
        from: from || undefined,
        to: to || undefined,
      });
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Tithes Report</h1>
      <div className={styles.form} style={{ marginBottom: '1.5rem' }}>
        <select
          value={churchId}
          onChange={(e) => setChurchId(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem' }}
        >
          <option value="">All churches</option>
          {churches.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="date"
          placeholder="From"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="date"
          placeholder="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <button onClick={loadReport} disabled={loading}>
          {loading ? 'Loading…' : 'Run report'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {report && (
        <div>
          <p className={styles.muted} style={{ marginBottom: '1rem' }}>
            Total: <strong>{report.totalAmount.toFixed(2)}</strong> ({report.count} records)
          </p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Member</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {report.items.map((t) => (
                <tr key={t.id}>
                  <td>{t.member?.fullName || t.memberId}</td>
                  <td>{Number(t.amount).toFixed(2)}</td>
                  <td>{t.category}</td>
                  <td>{new Date(t.recordedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
