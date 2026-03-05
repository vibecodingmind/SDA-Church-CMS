import { useState, useEffect } from 'react';
import { members as membersApi } from '../api/client';
import styles from './Members.module.css';

type Member = { id: string; fullName: string; email: string | null; churchId: string; phone?: string; status?: string };

export function Members() {
  const [list, setList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await membersApi.list();
      setList(data);
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
    setSubmitting(true);
    setError('');
    try {
      await membersApi.create({ fullName, email: email || undefined, phone: phone || undefined });
      setFullName('');
      setEmail('');
      setPhone('');
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
        <h1>Members</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add member'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
        <p className={styles.muted}>No members yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id}>
                <td>{editing?.id === m.id ? <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={styles.inlineInput} /> : m.fullName}</td>
                <td>{editing?.id === m.id ? <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.inlineInput} /> : (m.email || '—')}</td>
                <td>{editing?.id === m.id ? <input value={phone} onChange={(e) => setPhone(e.target.value)} className={styles.inlineInput} placeholder="Phone" /> : (m.phone || '—')}</td>
                <td>{m.status || 'ACTIVE'}</td>
                <td>
                  {editing?.id === m.id ? (
                    <>
                      <button className={styles.smBtn} onClick={async () => {
                        setSubmitting(true);
                        try {
                          await membersApi.update(m.id, { fullName, email: email || undefined, phone: phone || undefined });
                          setEditing(null);
                          load();
                        } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
                        finally { setSubmitting(false); }
                      }} disabled={submitting}>Save</button>
                      <button className={styles.smBtn} onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className={styles.smBtn} onClick={() => { setEditing(m); setFullName(m.fullName); setEmail(m.email || ''); setPhone(m.phone || ''); }}>Edit</button>
                      <button className={styles.smBtn} onClick={async () => {
                        if (confirm('Delete this member?')) {
                          setSubmitting(true);
                          try {
                            await membersApi.delete(m.id);
                            load();
                          } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
                          finally { setSubmitting(false); }
                        }
                      }} disabled={submitting}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
