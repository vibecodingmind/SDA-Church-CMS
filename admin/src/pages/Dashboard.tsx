import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className={styles.title}>Welcome, {user?.fullName}</h1>
      <p className={styles.subtitle}>Church Management System – Admin Panel</p>
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
