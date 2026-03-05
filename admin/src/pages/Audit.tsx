import { useState, useEffect } from 'react';
import { audit as auditApi } from '../api/client';
import styles from './DataTable.module.css';

type Log = { id: string; action: string; resource: string; userId: string; timestamp: string; metadata?: unknown };

export function Audit() {
  const [list, setList] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await auditApi.scope({ resource: resource || undefined, action: action || undefined, limit: 100 });
      setList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  return (
    <div>
      <h1>Audit Logs</h1>
      <form onSubmit={handleFilter} className={styles.form}>
        <input placeholder="Resource" value={resource} onChange={(e) => setResource(e.target.value)} />
        <input placeholder="Action" value={action} onChange={(e) => setAction(e.target.value)} />
        <button type="submit">Filter</button>
      </form>
      {error && <div className={styles.error}>{error}</div>}
      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : list.length === 0 ? (
        <p className={styles.muted}>No audit logs.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Resource</th>
              <th>User ID</th>
            </tr>
          </thead>
          <tbody>
            {list.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.timestamp).toLocaleString()}</td>
                <td>{l.action}</td>
                <td>{l.resource}</td>
                <td>{l.userId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
