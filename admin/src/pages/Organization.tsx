import { useState, useEffect } from 'react';
import { organization as orgApi } from '../api/client';
import styles from './DataTable.module.css';

type Conference = { id: string; name: string };
type District = { id: string; name: string; conferenceId: string };
type Church = { id: string; name: string; districtId: string };

export function Organization() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'conferences' | 'districts' | 'churches'>('conferences');

  const [cName, setCName] = useState('');
  const [dName, setDName] = useState('');
  const [dConferenceId, setDConferenceId] = useState('');
  const [chName, setChName] = useState('');
  const [chDistrictId, setChDistrictId] = useState('');
  const [showForm, setShowForm] = useState<'conference' | 'district' | 'church' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [c, d, ch] = await Promise.all([
        orgApi.conferences.list(),
        orgApi.districts.list(),
        orgApi.churches.list(),
      ]);
      setConferences(c);
      setDistricts(d);
      setChurches(ch);
      if (!dConferenceId && c[0]) setDConferenceId(c[0].id);
      if (!chDistrictId && d[0]) setChDistrictId(d[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddConference = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await orgApi.conferences.create({ name: cName });
      setCName('');
      setShowForm(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await orgApi.districts.create({ name: dName, conferenceId: dConferenceId });
      setDName('');
      setShowForm(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddChurch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await orgApi.churches.create({ name: chName, districtId: chDistrictId });
      setChName('');
      setShowForm(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Organization</h1>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.tabs}>
        {(['conferences', 'districts', 'churches'] as const).map((t) => (
          <button key={t} className={activeTab === t ? styles.tabActive : ''} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : (
        <>
          {activeTab === 'conferences' && (
            <>
              <button className={styles.addBtn} onClick={() => setShowForm('conference')}>+ Add conference</button>
              {showForm === 'conference' && (
                <form onSubmit={handleAddConference} className={styles.form}>
                  <input placeholder="Name" value={cName} onChange={(e) => setCName(e.target.value)} required />
                  <button type="submit" disabled={submitting}>Add</button>
                  <button type="button" onClick={() => setShowForm(null)}>Cancel</button>
                </form>
              )}
              <table className={styles.table}>
                <thead><tr><th>Name</th></tr></thead>
                <tbody>
                  {conferences.map((c) => (
                    <tr key={c.id}><td>{c.name}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {activeTab === 'districts' && (
            <>
              <button className={styles.addBtn} onClick={() => setShowForm('district')}>+ Add district</button>
              {showForm === 'district' && (
                <form onSubmit={handleAddDistrict} className={styles.form}>
                  <input placeholder="Name" value={dName} onChange={(e) => setDName(e.target.value)} required />
                  <select value={dConferenceId} onChange={(e) => setDConferenceId(e.target.value)}>
                    {conferences.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button type="submit" disabled={submitting}>Add</button>
                  <button type="button" onClick={() => setShowForm(null)}>Cancel</button>
                </form>
              )}
              <table className={styles.table}>
                <thead><tr><th>Name</th><th>Conference</th></tr></thead>
                <tbody>
                  {districts.map((d) => (
                    <tr key={d.id}>
                      <td>{d.name}</td>
                      <td>{conferences.find((c) => c.id === d.conferenceId)?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {activeTab === 'churches' && (
            <>
              <button className={styles.addBtn} onClick={() => setShowForm('church')}>+ Add church</button>
              {showForm === 'church' && (
                <form onSubmit={handleAddChurch} className={styles.form}>
                  <input placeholder="Name" value={chName} onChange={(e) => setChName(e.target.value)} required />
                  <select value={chDistrictId} onChange={(e) => setChDistrictId(e.target.value)}>
                    {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <button type="submit" disabled={submitting}>Add</button>
                  <button type="button" onClick={() => setShowForm(null)}>Cancel</button>
                </form>
              )}
              <table className={styles.table}>
                <thead><tr><th>Name</th><th>District</th></tr></thead>
                <tbody>
                  {churches.map((ch) => (
                    <tr key={ch.id}>
                      <td>{ch.name}</td>
                      <td>{districts.find((d) => d.id === ch.districtId)?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}
