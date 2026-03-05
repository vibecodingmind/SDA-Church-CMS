import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { reports } from '../api/client';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ membersCount: number; churchesCount: number; eventsCount: number; tithesTotal: number } | null>(null);

  useEffect(() => {
    reports.dashboard().then(setStats).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className={styles.title}>Welcome, {user?.fullName}</h1>
      <p className={styles.subtitle}>Church Management System – Admin Panel</p>
      {stats && (
        <div className={styles.cards} style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
          <div className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{stats.membersCount}</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--muted)' }}>Members</p>
          </div>
          <div className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{stats.churchesCount}</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--muted)' }}>Churches</p>
          </div>
          <div className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{stats.eventsCount}</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--muted)' }}>Events</p>
          </div>
          <div className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{stats.tithesTotal.toFixed(2)}</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--muted)' }}>Tithes Total</p>
          </div>
        </div>
      )}
      <div className={styles.cards}>
        <Link to="/members" className={styles.card}>
          <h3>Members</h3>
          <p>View and manage church members</p>
        </Link>
        <Link to="/users" className={styles.card}>
          <h3>Users</h3>
          <p>Manage admin users and invites</p>
        </Link>
        <Link to="/roles" className={styles.card}>
          <h3>Roles</h3>
          <p>Manage roles and permissions</p>
        </Link>
        <Link to="/permissions" className={styles.card}>
          <h3>Permissions</h3>
          <p>View system permissions</p>
        </Link>
        <Link to="/organization" className={styles.card}>
          <h3>Organization</h3>
          <p>Conferences, districts, churches</p>
        </Link>
        <Link to="/audit" className={styles.card}>
          <h3>Audit Logs</h3>
          <p>View activity logs</p>
        </Link>
      </div>
    </div>
  );
}
