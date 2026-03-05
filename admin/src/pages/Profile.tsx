import { useState } from 'react';
import { auth as authApi } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import styles from './Members.module.css';

export function Profile() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Profile</h1>
      <p className={styles.muted}>{user?.fullName} — {user?.email}</p>

      <h2 style={{ marginTop: '1.5rem' }}>Change Password</h2>
      <form onSubmit={handleSubmit} className={styles.form} style={{ flexDirection: 'column', alignItems: 'flex-start', maxWidth: '400px' }}>
        <label style={{ width: '100%', marginBottom: '0.5rem' }}>
          Current password
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            style={{ width: '100%', marginTop: '0.25rem' }}
          />
        </label>
        <label style={{ width: '100%', marginBottom: '0.5rem' }}>
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: '100%', marginTop: '0.25rem' }}
          />
        </label>
        <label style={{ width: '100%', marginBottom: '0.5rem' }}>
          Confirm new password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', marginTop: '0.25rem' }}
          />
        </label>
        {error && <div className={styles.error}>{error}</div>}
        {message && <div style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>{message}</div>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Changing…' : 'Change password'}
        </button>
      </form>
    </div>
  );
}
