import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './Layout.module.css';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Church CMS</div>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.active : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/members" className={({ isActive }) => (isActive ? styles.active : '')}>
            Members
          </NavLink>
          <NavLink to="/tithes" className={({ isActive }) => (isActive ? styles.active : '')}>
            Tithes
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => (isActive ? styles.active : '')}>
            Events
          </NavLink>
          <NavLink to="/ministries" className={({ isActive }) => (isActive ? styles.active : '')}>
            Ministries
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => (isActive ? styles.active : '')}>
            Users
          </NavLink>
          <NavLink to="/roles" className={({ isActive }) => (isActive ? styles.active : '')}>
            Roles
          </NavLink>
          <NavLink to="/permissions" className={({ isActive }) => (isActive ? styles.active : '')}>
            Permissions
          </NavLink>
          <NavLink to="/organization" className={({ isActive }) => (isActive ? styles.active : '')}>
            Organization
          </NavLink>
          <NavLink to="/audit" className={({ isActive }) => (isActive ? styles.active : '')}>
            Audit Logs
          </NavLink>
          <NavLink to="/households" className={({ isActive }) => (isActive ? styles.active : '')}>
            Households
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? styles.active : '')}>
            Profile
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => (isActive ? styles.active : '')}>
            Reports
          </NavLink>
        </nav>
        <div className={styles.user}>
          <span className={styles.userName}>{user?.fullName}</span>
          <span className={styles.userEmail}>{user?.email}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
