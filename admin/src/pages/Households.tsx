import { useState, useEffect } from 'react';
import { households as householdsApi, organization } from '../api/client';
import styles from './Members.module.css';

export function Households() {
  const [list, setList] = useState<any[]>([]);
  const [churches, setChurches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [churchId, setChurchId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [h, ch] = await Promise.all([
        householdsApi.list(),
        organization.churches.list(),
      ]);
      setList(h);
      setChurches(ch);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchId || !name) return;
    setSubmitting(true);
    setError('');
    try {
      await householdsApi.create({
        churchId,
        name,
        address: address || undefined,
      });
      setChurchId('');
      setName('');
      setAddress('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Households</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add household'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <select
            value={churchId}
            onChange={(e) => setChurchId(e.target.value)}
            required
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem' }}
          >
            <option value="">Select church</option>
            {churches.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            placeholder="Household name (e.g. Smith Family)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add'}
          </button>
        </form>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : list.length === 0 ? (
        <p className={styles.muted}>No households yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Members</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((h) => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td>{h.address || '—'}</td>
                <td>{h._count?.members ?? 0}</td>
                <td>
                  <button
                    className={styles.smBtn}
                    onClick={async () => {
                      if (confirm('Delete this household?')) {
                        try {
                          await householdsApi.delete(h.id);
                          load();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Failed');
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
