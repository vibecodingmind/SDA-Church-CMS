import { useState, useEffect } from 'react';
import { ministries as ministriesApi, organization, members as membersApi } from '../api/client';
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
  const [manageMinistry, setManageMinistry] = useState<any | null>(null);
  const [assignMemberId, setAssignMemberId] = useState('');
  const [members, setMembers] = useState<any[]>([]);

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
                      try {
                        const detail = await ministriesApi.get(m.id);
                        const mems = await membersApi.list();
                        setManageMinistry(detail);
                        setMembers(mems.filter((mb) => mb.churchId === detail.churchId));
                        setAssignMemberId('');
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed');
                      }
                    }}
                  >
                    Manage
                  </button>
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

      {manageMinistry && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '0.5rem', maxWidth: '400px', width: '90%' }}>
            <h2 style={{ margin: '0 0 1rem' }}>Manage: {manageMinistry.name}</h2>
            <p className={styles.muted} style={{ marginBottom: '1rem' }}>Assigned members</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem', maxHeight: '200px', overflow: 'auto' }}>
              {(manageMinistry.memberMinistries || []).map((mm: any) => (
                <li key={mm.memberId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0' }}>
                  <span>{mm.member?.fullName || mm.memberId}</span>
                  <button
                    className={styles.smBtn}
                    onClick={async () => {
                      try {
                        await ministriesApi.removeMember(manageMinistry.id, mm.memberId);
                        const detail = await ministriesApi.get(manageMinistry.id);
                        setManageMinistry(detail);
                        load();
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed');
                      }
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
              {(!manageMinistry.memberMinistries || manageMinistry.memberMinistries.length === 0) && (
                <li className={styles.muted}>No members assigned</li>
              )}
            </ul>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <select
                value={assignMemberId}
                onChange={(e) => setAssignMemberId(e.target.value)}
                style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '0.5rem' }}
              >
                <option value="">Add member…</option>
                {members
                  .filter((mb) => !(manageMinistry.memberMinistries || []).some((mm: any) => mm.memberId === mb.id))
                  .map((mb) => (
                    <option key={mb.id} value={mb.id}>{mb.fullName}</option>
                  ))}
              </select>
              <button
                className={styles.addBtn}
                disabled={!assignMemberId}
                onClick={async () => {
                  if (!assignMemberId) return;
                  try {
                    await ministriesApi.assignMember(manageMinistry.id, { memberId: assignMemberId });
                    const detail = await ministriesApi.get(manageMinistry.id);
                    setManageMinistry(detail);
                    setAssignMemberId('');
                    load();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed');
                  }
                }}
              >
                Add
              </button>
            </div>
            <button className={styles.smBtn} onClick={() => setManageMinistry(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
