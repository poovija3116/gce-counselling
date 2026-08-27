import { useMemo, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CounsellingTable from './CounsellingTable';
import { getRowMetrics, getTotals, initialCounsellingData } from './counsellingData';
import './counselling.css';

export default function CounsellingStatusPage() {
  const [rows, setRows] = useState(initialCounsellingData);
  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('branch');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [heldBranch, setHeldBranch] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const totals = getTotals(rows);
  const displayedRows = useMemo(() => rows.filter((row) => { const item = getRowMetrics(row); return item.branch.toLowerCase().includes(search.toLowerCase()) && (availability === 'all' || item.status.toLowerCase() === availability); }).sort((a, b) => sortBy === 'available' ? getRowMetrics(b).availableSeats - getRowMetrics(a).availableSeats : a.branch.localeCompare(b.branch)), [rows, search, availability, sortBy]);
  const updateRow = (branch, update) => setRows((current) => current.map((row) => row.branch === branch ? update(row) : row));
  const reserveSeat = () => { if (!selectedBranch) return; const candidate = getRowMetrics(rows.find((row) => row.branch === selectedBranch)); if (!candidate.availableSeats) return; updateRow(selectedBranch, (row) => ({ ...row, heldSeats: row.heldSeats + 1 })); setHeldBranch(selectedBranch); setSelectedBranch(''); };
  const confirmSeat = () => { if (!heldBranch) return; updateRow(heldBranch, (row) => ({ ...row, heldSeats: Math.max(0, row.heldSeats - 1), allottedSeats: row.allottedSeats + 1 })); setHeldBranch(''); };
  return <><Header /><main className="counselling-page"><section className="counselling-hero"><div className="container"><a className="back-link" href="#top">← Back to home</a><p className="eyebrow light">ADMISSIONS 2026 · LIVE UPDATES</p><h1>Course-wise Counselling Status</h1><p>Check current vacancies, allotment progress, and seat availability across GCE Erode programmes.</p></div></section><section className="counselling-content container"><div className="summary-grid"><SummaryCard label="Total Seats" value={totals.totalSeats} icon="◫" /><SummaryCard label="Available Seats" value={totals.availableSeats} icon="◌" emphasis /><SummaryCard label="Filled Seats" value={totals.filled} icon="✓" /><SummaryCard label="Courses Available" value={rows.filter((row) => getRowMetrics(row).availableSeats > 0).length} icon="▤" /></div>
  <div className="status-panel"><div className="panel-heading"><div><p className="eyebrow">LIVE VACANCY TABLE</p><h2>Current counselling availability</h2><p>Seat status updates immediately in this frontend demonstration.</p></div><button className={isAdmin ? 'admin-toggle active' : 'admin-toggle'} onClick={() => setIsAdmin(!isAdmin)}>{isAdmin ? 'Admin editing enabled' : 'Admin edit mode'}</button></div>
  {isAdmin && <div className="admin-notice"><span>✦</span><div><strong>Admin editing mode</strong><p>Change Total, Allotted, Remaining, or Held values directly in the table. Values are held locally for this demo.</p></div><button className="reset-button" onClick={() => { setRows(initialCounsellingData); setHeldBranch(''); }}>Reset counts</button></div>}
  <div className="table-controls"><label><span>Search branch</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. CSE" /></label><label><span>Availability</span><select value={availability} onChange={(event) => setAvailability(event.target.value)}><option value="all">All statuses</option><option value="available">Available</option><option value="full">Full</option></select></label><label><span>Sort by</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="branch">Branch name</option><option value="available">Most available seats</option></select></label></div>
  <CounsellingTable rows={displayedRows} isAdmin={isAdmin} onUpdate={updateRow} /></div>
  <section className="seat-selection"><div><p className="eyebrow">STUDENT DEMO</p><h2>Reserve an available seat</h2><p>Select a branch to place a temporary seat hold. The available count will decrease immediately.</p></div><div className="seat-action"><label htmlFor="branch-select">Choose a programme</label><select id="branch-select" value={selectedBranch} onChange={(event) => setSelectedBranch(event.target.value)}><option value="">Select a branch</option>{rows.map((rawRow) => { const row = getRowMetrics(rawRow); return <option value={row.branch} disabled={!row.availableSeats} key={row.branch}>{row.branch} — {row.availableSeats ? `${row.availableSeats} seats available` : 'FULL'}</option>; })}</select><button className="button button-primary" onClick={reserveSeat} disabled={!selectedBranch}>Hold this seat →</button></div></section>
  {heldBranch && <div className="hold-banner"><span className="hold-icon">◷</span><div><strong>Seat temporarily held in {heldBranch}</strong><p>Availability is updated. Confirm to move it from HELD to CONFIRMED.</p></div><button className="button button-accent" onClick={confirmSeat}>Confirm seat</button></div>}
  </section></main><Footer /></>;
}

function SummaryCard({ label, value, icon, emphasis }) { return <article className={emphasis ? 'summary-card emphasis' : 'summary-card'}><span className="summary-icon">{icon}</span><div><p>{label}</p><strong>{value}</strong></div></article>; }
