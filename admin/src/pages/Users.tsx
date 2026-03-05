import { useState, useEffect } from 'react';
import { users as usersApi, roles as rolesApi } from '../api/client';
import styles from './DataTable.module.css';

export function Users() {
  const [list, setList] = useState<any[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [u, r] = await Promise.all([usersApi.list(), rolesApi.list()]);
      setList(u);
      setRoles(r);
      if (r[0] && !inviteRoleId) setInviteRoleId(r[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await usersApi.invite({ email: inviteEmail, roleId: inviteRoleId });
      setInviteEmail('');
      setShowInvite(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Users</h1>
        <button className={styles.addBtn} onClick={() => setShowInvite(!showInvite)}>
          {showInvite ? 'Cancel' : '+ Invite user'}
        </button>
      </div>
      {showInvite && (
        <form onSubmit={handleInvite} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <select value={inviteRoleId} onChange={(e) => setInviteRoleId(e.target.value)}>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send invite'}
          </button>
        </form>
      )}
      {error && <div className={styles.error}>{error}</div>}
      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : list.length === 0 ? (
        <p className={styles.muted}>No users.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
