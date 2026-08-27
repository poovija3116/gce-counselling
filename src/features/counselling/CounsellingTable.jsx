import { getRowMetrics, getTotals } from './counsellingData';

const NumberField = ({ value, onChange, min = 0, label }) => <input aria-label={label} className="table-number-input" type="number" min={min} value={value} onChange={(event) => onChange(Math.max(min, Number(event.target.value) || 0))} />;

export default function CounsellingTable({ rows, isAdmin, onUpdate }) {
  const totals = getTotals(rows);
  const updateField = (branch, field, value) => onUpdate(branch, (row) => {
    if (field === 'availableSeats') return { ...row, totalSeats: row.allottedSeats + row.heldSeats + value };
    if (field === 'allottedSeats') return { ...row, allottedSeats: Math.min(value, row.totalSeats - row.heldSeats) };
    if (field === 'heldSeats') return { ...row, heldSeats: Math.min(value, row.totalSeats - row.allottedSeats) };
    return { ...row, [field]: Math.max(value, row.allottedSeats + row.heldSeats) };
  });
  const displayNumber = (row, field, label) => isAdmin ? <NumberField label={`${row.branch} ${label}`} value={row[field]} onChange={(value) => updateField(row.branch, field, value)} /> : row[field];
  return <div className="counselling-table-wrap"><table className="counselling-table">
    <thead><tr><th rowSpan="2" scope="col">Branch</th><th colSpan="3" scope="colgroup">Seat Capacity</th><th colSpan="3" scope="colgroup">Counselling & Allotment</th><th colSpan="2" scope="colgroup">Current Status</th></tr><tr><th scope="col">Total</th><th scope="col">Allotted</th><th scope="col">Remaining</th><th scope="col">Held</th><th scope="col">Confirmed</th><th scope="col">Filled</th><th scope="col">Available</th><th scope="col">Status</th></tr></thead>
    <tbody>{rows.map((rawRow) => { const row = getRowMetrics(rawRow); return <tr key={row.branch}><th scope="row">{row.branch}</th><td>{displayNumber(row, 'totalSeats', 'total seats')}</td><td>{displayNumber(row, 'allottedSeats', 'allotted seats')}</td><td>{displayNumber(row, 'availableSeats', 'remaining seats')}</td><td>{displayNumber(row, 'heldSeats', 'held seats')}</td><td>{row.allottedSeats}</td><td>{row.filled}</td><td className={row.availableSeats ? 'available-count' : 'full-count'}>{row.availableSeats || 'FULL'}</td><td><span className={`status-badge ${row.status.toLowerCase()}`}>{row.status}</span></td></tr>; })}</tbody>
    <tfoot><tr><th scope="row">TOTAL</th><td>{totals.totalSeats}</td><td>{totals.allottedSeats}</td><td>{totals.availableSeats}</td><td>{totals.heldSeats}</td><td>{totals.allottedSeats}</td><td>{totals.filled}</td><td>{totals.availableSeats}</td><td><span className="status-badge total">LIVE</span></td></tr></tfoot>
  </table></div>;
}
