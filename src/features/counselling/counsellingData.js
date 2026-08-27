export const initialCounsellingData = [
  { branch: 'AUTO', totalSeats: 60, allottedSeats: 38, heldSeats: 2 },
  { branch: 'CIVIL', totalSeats: 60, allottedSeats: 52, heldSeats: 1 },
  { branch: 'MECH', totalSeats: 60, allottedSeats: 44, heldSeats: 3 },
  { branch: 'CSE', totalSeats: 120, allottedSeats: 116, heldSeats: 2 },
  { branch: 'ECE', totalSeats: 90, allottedSeats: 77, heldSeats: 4 },
  { branch: 'EEE', totalSeats: 60, allottedSeats: 58, heldSeats: 2 },
  { branch: 'IT', totalSeats: 60, allottedSeats: 52, heldSeats: 3 },
  { branch: 'CSE DS', totalSeats: 60, allottedSeats: 57, heldSeats: 1 },
];

export function getRowMetrics(row) {
  const filled = row.allottedSeats + row.heldSeats;
  return { ...row, filled, availableSeats: Math.max(0, row.totalSeats - filled), status: row.totalSeats - filled > 0 ? 'AVAILABLE' : 'FULL' };
}

export function getTotals(rows) {
  return rows.reduce((totals, row) => {
    const metrics = getRowMetrics(row);
    totals.totalSeats += metrics.totalSeats;
    totals.allottedSeats += metrics.allottedSeats;
    totals.heldSeats += metrics.heldSeats;
    totals.filled += metrics.filled;
    totals.availableSeats += metrics.availableSeats;
    return totals;
  }, { totalSeats: 0, allottedSeats: 0, heldSeats: 0, filled: 0, availableSeats: 0 });
}
