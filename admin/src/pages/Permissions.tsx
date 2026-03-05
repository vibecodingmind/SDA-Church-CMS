import { useState, useEffect } from 'react';
import { permissions as permsApi } from '../api/client';
import styles from './DataTable.module.css';

type Perm = { id: string; name: string; resource: string; action: string; description: string | null };

export function Permissions() {
  const [list, setList] = useState<Perm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    permsApi
      .list()
      .then(setList)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Permissions</h1>
      {error && <div className={styles.error}>{error}</div>}
      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : list.length === 0 ? (
        <p className={styles.muted}>No permissions.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Resource</th>
              <th>Action</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.resource}</td>
                <td>{p.action}</td>
                <td>{p.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
