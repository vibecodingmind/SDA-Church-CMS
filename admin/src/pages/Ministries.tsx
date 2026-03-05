import { useState, useEffect } from 'react';
import { ministries as ministriesApi, organization } from '../api/client';
import styles from './Members.module.css';

export function Ministries() {
  const [list, setList] = useState<any[]>([]);
  const [churches, setChurches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [churchId, setChurchId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [m, ch] = await Promise.all([
        ministriesApi.list(),
        organization.churches.list(),
      ]);
      setList(m);
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
      await ministriesApi.create({
        churchId,
        name,
        description: description || undefined,
      });
      setChurchId('');
      setName('');
      setDescription('');
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
        <h1>Ministries</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add ministry'}
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
            placeholder="Ministry name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
        <p className={styles.muted}>No ministries yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Members</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.description || '—'}</td>
                <td>{m._count?.memberMinistries ?? 0}</td>
                <td>
                  <button
                    className={styles.smBtn}
                    onClick={async () => {
                      if (confirm('Delete this ministry?')) {
                        try {
                          await ministriesApi.delete(m.id);
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
