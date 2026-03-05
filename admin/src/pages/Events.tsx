import { useState, useEffect } from 'react';
import { events as eventsApi, organization, attendance as attendanceApi, members as membersApi } from '../api/client';
import styles from './Members.module.css';

export function Events() {
  const [list, setList] = useState<any[]>([]);
  const [churches, setChurches] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [churchId, setChurchId] = useState('');
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState('SERVICE');
  const [submitting, setSubmitting] = useState(false);
  const [checkInEvent, setCheckInEvent] = useState<any | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [e, ch, m] = await Promise.all([
        eventsApi.list(),
        organization.churches.list(),
        membersApi.list(),
      ]);
      setList(e);
      setChurches(ch);
      setMembers(m);
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
    if (!churchId || !title || !eventDate) return;
    setSubmitting(true);
    setError('');
    try {
      await eventsApi.create({
        churchId,
        title,
        eventDate,
        eventType,
      });
      setChurchId('');
      setTitle('');
      setEventDate('');
      setEventType('SERVICE');
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
        <h1>Events</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add event'}
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
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem' }}
          >
            <option value="SERVICE">Service</option>
            <option value="MEETING">Meeting</option>
            <option value="PROGRAM">Program</option>
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
        <p className={styles.muted}>No events yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Date</th>
              <th>Attendance</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((ev) => (
              <tr key={ev.id}>
                <td>{ev.title}</td>
                <td>{ev.eventType}</td>
                <td>{new Date(ev.eventDate).toLocaleString()}</td>
                <td>{ev._count?.attendances ?? 0}</td>
                <td>
                  <button
                    className={styles.smBtn}
                    onClick={() => {
                      setCheckInEvent(ev);
                      setSelectedMemberIds(new Set());
                    }}
                  >
                    Check In
                  </button>
                  <button
                    className={styles.smBtn}
                    onClick={async () => {
                      if (confirm('Delete this event?')) {
                        try {
                          await eventsApi.delete(ev.id);
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

      {checkInEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '0.5rem', maxWidth: '400px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <h2 style={{ margin: '0 0 1rem' }}>Check In: {checkInEvent.title}</h2>
            <p className={styles.muted} style={{ marginBottom: '1rem' }}>Select members present</p>
            <div style={{ maxHeight: '250px', overflow: 'auto', marginBottom: '1rem' }}>
              {members
                .filter((m) => m.churchId === checkInEvent.churchId)
                .map((m) => (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.has(m.id)}
                      onChange={(e) => {
                        const next = new Set(selectedMemberIds);
                        if (e.target.checked) next.add(m.id);
                        else next.delete(m.id);
                        setSelectedMemberIds(next);
                      }}
                    />
                    <span>{m.fullName}</span>
                  </label>
                ))}
              {members.filter((m) => m.churchId === checkInEvent.churchId).length === 0 && (
                <p className={styles.muted}>No members in this church</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={styles.addBtn}
                disabled={selectedMemberIds.size === 0}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    for (const memberId of selectedMemberIds) {
                      await attendanceApi.create({ eventId: checkInEvent.id, memberId });
                    }
                    setCheckInEvent(null);
                    load();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to record attendance');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {submitting ? 'Saving…' : `Record ${selectedMemberIds.size} attendance`}
              </button>
              <button className={styles.smBtn} onClick={() => setCheckInEvent(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
