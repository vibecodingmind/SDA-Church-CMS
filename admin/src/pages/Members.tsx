import { useState, useEffect } from 'react';
import { members as membersApi, organization, households as householdsApi } from '../api/client';
import styles from './Members.module.css';

type Member = { id: string; fullName: string; email: string | null; churchId: string; phone?: string; status?: string; householdId?: string };

export function Members() {
  const [list, setList] = useState<Member[]>([]);
  const [churches, setChurches] = useState<any[]>([]);
  const [households, setHouseholds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [churchId, setChurchId] = useState('');
  const [householdId, setHouseholdId] = useState('');
  const [bulkChurchId, setBulkChurchId] = useState('');
  const [bulkHouseholdId, setBulkHouseholdId] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [data, ch, h] = await Promise.all([
        membersApi.list(),
        organization.churches.list(),
        householdsApi.list(),
      ]);
      setList(data);
      setChurches(ch);
      setHouseholds(h);
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
    if (!churchId) return;
    setSubmitting(true);
    setError('');
    try {
      await membersApi.create({
        fullName,
        email: email || undefined,
        phone: phone || undefined,
        churchId,
        householdId: householdId || undefined,
      });
      setFullName('');
      setEmail('');
      setPhone('');
      setChurchId('');
      setHouseholdId('');
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
        <button className={styles.addBtn} onClick={() => { setShowForm(!showForm); setShowBulk(false); }}>
          {showForm ? 'Cancel' : '+ Add member'}
        </button>
        <button className={styles.addBtn} onClick={() => { setShowBulk(!showBulk); setShowForm(false); }}>
          {showBulk ? 'Cancel' : 'Bulk import'}
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
            value={householdId}
            onChange={(e) => setHouseholdId(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem' }}
          >
            <option value="">No household</option>
            {households.filter((h) => !churchId || h.churchId === churchId).map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
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

      {showBulk && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!bulkChurchId || !bulkText.trim()) return;
            const lines = bulkText.trim().split('\n').filter(Boolean);
            const members = lines.map((line) => {
              const parts = line.split(/[,\t]/).map((p) => p.trim());
              return {
                fullName: parts[0] || '',
                email: parts[1] || undefined,
                phone: parts[2] || undefined,
              };
            }).filter((m) => m.fullName);
            if (members.length === 0) {
              setError('Enter at least one member (name, optional email, optional phone per line)');
              return;
            }
            setSubmitting(true);
            setError('');
            try {
              const res = await membersApi.bulkCreate({
                churchId: bulkChurchId,
                householdId: bulkHouseholdId || undefined,
                members,
              });
              setBulkText('');
              setShowBulk(false);
              setError('');
              alert(`Created ${res.created} members`);
              load();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed');
            } finally {
              setSubmitting(false);
            }
          }}
          className={styles.form}
          style={{ flexDirection: 'column', alignItems: 'flex-start', maxWidth: '500px' }}
        >
          <select
            value={bulkChurchId}
            onChange={(e) => setBulkChurchId(e.target.value)}
            required
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', width: '100%', marginBottom: '0.5rem' }}
          >
            <option value="">Select church</option>
            {churches.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={bulkHouseholdId}
            onChange={(e) => setBulkHouseholdId(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', width: '100%', marginBottom: '0.5rem' }}
          >
            <option value="">No household</option>
            {households.filter((h) => !bulkChurchId || h.churchId === bulkChurchId).map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          <label style={{ width: '100%', marginBottom: '0.5rem' }}>
            Members (one per line: name, email, phone — comma or tab separated)
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={'John Doe, john@example.com, 555-1234\nJane Smith\nBob Wilson, bob@example.com'}
              rows={6}
              style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem', borderRadius: '0.5rem', fontFamily: 'inherit' }}
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Importing…' : 'Import'}
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
              <th>Household</th>
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
                <td>
                  {editing?.id === m.id ? (
                    <select value={householdId} onChange={(e) => setHouseholdId(e.target.value)} className={styles.inlineInput} style={{ padding: '0.25rem', minWidth: '120px' }}>
                      <option value="">None</option>
                      {households.filter((h) => h.churchId === m.churchId).map((h) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  ) : (
                    households.find((h) => h.id === m.householdId)?.name || '—'
                  )}
                </td>
                <td>
                  {editing?.id === m.id ? (
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.inlineInput} style={{ padding: '0.25rem' }}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="TRANSFERRED">TRANSFERRED</option>
                      <option value="DECEASED">DECEASED</option>
                    </select>
                  ) : (
                    m.status || 'ACTIVE'
                  )}
                </td>
                <td>
                  {editing?.id === m.id ? (
                    <>
                      <button className={styles.smBtn} onClick={async () => {
                        setSubmitting(true);
                        try {
                          await membersApi.update(m.id, {
                            fullName,
                            email: email || undefined,
                            phone: phone || undefined,
                            status,
                            householdId: householdId || undefined,
                          });
                          setEditing(null);
                          load();
                        } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
                        finally { setSubmitting(false); }
                      }} disabled={submitting}>Save</button>
                      <button className={styles.smBtn} onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className={styles.smBtn} onClick={() => { setEditing(m); setFullName(m.fullName); setEmail(m.email || ''); setPhone(m.phone || ''); setStatus(m.status || 'ACTIVE'); setHouseholdId(m.householdId || ''); }}>Edit</button>
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
