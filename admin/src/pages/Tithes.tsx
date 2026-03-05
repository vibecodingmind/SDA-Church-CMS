import { useState, useEffect } from 'react';
import { tithes as tithesApi, members as membersApi, organization } from '../api/client';
import styles from './Members.module.css';

export function Tithes() {
  const [list, setList] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [churches, setChurches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [churchId, setChurchId] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('TITHE');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [t, m, ch] = await Promise.all([
        tithesApi.list(),
        membersApi.list(),
        organization.churches.list(),
      ]);
      setList(t);
      setMembers(m);
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
    if (!memberId || !churchId || !amount) return;
    setSubmitting(true);
    setError('');
    try {
      await tithesApi.create({
        memberId,
        churchId,
        amount: parseFloat(amount),
        category,
      });
      setMemberId('');
      setChurchId('');
      setAmount('');
      setCategory('TITHE');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add');
    } finally {
      setSubmitting(false);
    }
  };

  const memberMap = Object.fromEntries(members.map((m) => [m.id, m.fullName]));

  return (
    <div>
      <div className={styles.header}>
        <h1>Tithes & Offerings</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Record tithe'}
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
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem' }}
          >
            <option value="">Select member</option>
            {members
              .filter((m) => !churchId || m.churchId === churchId || (m.church && m.church.id === churchId))
              .map((m) => (
                <option key={m.id} value={m.id}>{m.fullName}</option>
              ))}
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem' }}
          >
            <option value="TITHE">Tithe</option>
            <option value="OFFERING">Offering</option>
            <option value="SPECIAL">Special</option>
          </select>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add'}
          </button>
        </form>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : list.length === 0 ? (
        <p className={styles.muted}>No tithes recorded yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Member</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id}>
                <td>{t.member ? t.member.fullName : memberMap[t.memberId] || t.memberId}</td>
                <td>{Number(t.amount).toFixed(2)}</td>
                <td>{t.category}</td>
                <td>{new Date(t.recordedAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className={styles.smBtn}
                    onClick={async () => {
                      if (confirm('Delete this record?')) {
                        try {
                          await tithesApi.delete(t.id);
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
