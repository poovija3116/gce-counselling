import { useState } from "react";
import "./App.css";

const initialCandidates = [
  { rank: 1, appNo: "GCE2026001", name: "Candidate 01", category: "Eligible", course: "CSE", status: "Waiting" },
  { rank: 2, appNo: "GCE2026002", name: "Candidate 02", category: "Eligible", course: "IT", status: "Waiting" },
  { rank: 3, appNo: "GCE2026003", name: "Candidate 03", category: "Eligible", course: "ECE", status: "Waiting" },
  { rank: 4, appNo: "GCE2026004", name: "Candidate 04", category: "Eligible", course: "CSE", status: "Waiting" },
  { rank: 5, appNo: "GCE2026005", name: "Candidate 05", category: "Eligible", course: "IT", status: "Waiting" },
  { rank: 6, appNo: "GCE2026006", name: "Candidate 06", category: "Eligible", course: "EEE", status: "Waiting" },
  { rank: 7, appNo: "GCE2026007", name: "Candidate 07", category: "Eligible", course: "CSE", status: "Waiting" },
  { rank: 8, appNo: "GCE2026008", name: "Candidate 08", category: "Eligible", course: "IT", status: "Waiting" },
  { rank: 9, appNo: "GCE2026009", name: "Candidate 09", category: "Eligible", course: "ECE", status: "Waiting" },
  { rank: 10, appNo: "GCE2026010", name: "Candidate 10", category: "Eligible", course: "CSE", status: "Waiting" },
  { rank: 11, appNo: "GCE2026011", name: "Candidate 11", category: "Eligible", course: "IT", status: "Waiting" },
  { rank: 12, appNo: "GCE2026012", name: "Candidate 12", category: "Eligible", course: "ECE", status: "Waiting" },
];

const initialDepartments = [
  { name: "CSE", total: 60, available: 5 },
  { name: "IT", total: 60, available: 8 },
  { name: "ECE", total: 60, available: 3 },
  { name: "EEE", total: 60, available: 0 },
  { name: "MECH", total: 60, available: 6 },
  { name: "CIVIL", total: 60, available: 4 },
];

function App() {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [departments, setDepartments] = useState(initialDepartments);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [allotment, setAllotment] = useState(null);

  const callCandidate = (candidate) => {
    setCandidates((prev) =>
      prev.map((item) =>
        item.rank === candidate.rank
          ? { ...item, status: "Counselling" }
          : item
      )
    );

    setCurrentCandidate({
      ...candidate,
      status: "Counselling",
    });

    setSelectedDepartment(null);
    setAllotment(null);
  };

  const selectDepartment = (department) => {
    if (department.available === 0) return;
    setSelectedDepartment(department);
  };

  const confirmAllotment = () => {
    if (!currentCandidate || !selectedDepartment) return;

    const seatNumber =
      `${selectedDepartment.name}-${selectedDepartment.total - selectedDepartment.available + 1}`;

    setCandidates((prev) =>
      prev.map((item) =>
        item.rank === currentCandidate.rank
          ? { ...item, status: "Allotted" }
          : item
      )
    );

    setDepartments((prev) =>
      prev.map((dept) =>
        dept.name === selectedDepartment.name
          ? { ...dept, available: dept.available - 1 }
          : dept
      )
    );

    setAllotment({
      candidate: currentCandidate,
      department: selectedDepartment.name,
      seatNumber,
      fee: "₹50,000",
    });

    setCurrentCandidate(null);
    setSelectedDepartment(null);
    setShowConfirm(false);
  };

  const totalCandidates = 550;

  const calledCount = candidates.filter(
    (candidate) => candidate.status !== "Waiting"
  ).length;

  const allottedCount = candidates.filter(
    (candidate) => candidate.status === "Allotted"
  ).length;

  const waitingCount = totalCandidates - calledCount;

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>GCE ERODE</h1>
          <p>Online Counselling & Seat Allocation</p>
        </div>

        <div className="live">
          <span></span>
          LIVE COUNSELLING
        </div>
      </header>

      <main className="container">

        <div className="page-title">
          <div>
            <h2>Live Counselling</h2>
            <p>Candidate queue and real-time seat allocation</p>
          </div>
        </div>

        {/* SUMMARY */}

        <section className="summary">
          <div className="summary-card">
            <span>Total Candidates</span>
            <strong>{totalCandidates}</strong>
          </div>

          <div className="summary-card">
            <span>Called</span>
            <strong>{calledCount}</strong>
          </div>

          <div className="summary-card">
            <span>Allotted</span>
            <strong>{allottedCount}</strong>
          </div>

          <div className="summary-card">
            <span>Waiting</span>
            <strong>{waitingCount}</strong>
          </div>
        </section>

        {/* CURRENT CANDIDATE */}

        {currentCandidate && (
          <section className="current-candidate">
            <div className="section-heading">
              <h3>Current Candidate</h3>
              <span className="status counselling">COUNSELLING</span>
            </div>

            <div className="candidate-details">
              <div>
                <small>Rank</small>
                <strong>#{currentCandidate.rank}</strong>
              </div>

              <div>
                <small>Application No.</small>
                <strong>{currentCandidate.appNo}</strong>
              </div>

              <div>
                <small>Candidate Name</small>
                <strong>{currentCandidate.name}</strong>
              </div>

              <div>
                <small>Preferred Course</small>
                <strong>{currentCandidate.course}</strong>
              </div>
            </div>
          </section>
        )}

        {/* ALLOTMENT SUCCESS */}

        {allotment && (
          <section className="success-box">
            <div className="success-icon">✓</div>

            <div>
              <h3>Seat Allotted Successfully</h3>

              <p>
                {allotment.candidate.name} has been allotted{" "}
                <strong>{allotment.department}</strong>
              </p>

              <div className="allotment-details">
                <span>
                  Seat: <strong>{allotment.seatNumber}</strong>
                </span>

                <span>
                  Fee: <strong>{allotment.fee}</strong>
                </span>
              </div>
            </div>
          </section>
        )}

        {/* CANDIDATE TABLE */}

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Candidate Queue</h3>
              <p>Click CALL to start counselling</p>
            </div>

            <span className="candidate-count">
              Showing {candidates.length} of 550
            </span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Application No.</th>
                  <th>Candidate Name</th>
                  <th>Category</th>
                  <th>Preferred Course</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.rank}>
                    <td>
                      <strong>#{candidate.rank}</strong>
                    </td>

                    <td>{candidate.appNo}</td>

                    <td className="candidate-name">
                      {candidate.name}
                    </td>

                    <td>{candidate.category}</td>

                    <td>{candidate.course}</td>

                    <td>
                      <span
                        className={`status ${candidate.status.toLowerCase()}`}
                      >
                        {candidate.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="call-btn"
                        disabled={candidate.status !== "Waiting"}
                        onClick={() => callCandidate(candidate)}
                      >
                        {candidate.status === "Waiting"
                          ? "CALL"
                          : candidate.status.toUpperCase()}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SEAT TABLE */}

        {currentCandidate && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h3>Seat Availability</h3>
                <p>Select a department for the current candidate</p>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Total Seats</th>
                    <th>Available</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {departments.map((department) => (
                    <tr
                      key={department.name}
                      className={
                        selectedDepartment?.name === department.name
                          ? "selected-row"
                          : ""
                      }
                    >
                      <td>
                        <strong>{department.name}</strong>
                      </td>

                      <td>{department.total}</td>

                      <td>
                        <strong>{department.available}</strong>
                      </td>

                      <td>
                        <span
                          className={`seat-status ${
                            department.available === 0
                              ? "full"
                              : department.available <= 3
                              ? "few"
                              : "available"
                          }`}
                        >
                          {department.available === 0
                            ? "FULL"
                            : department.available <= 3
                            ? "FEW SEATS"
                            : "AVAILABLE"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="select-btn"
                          disabled={department.available === 0}
                          onClick={() =>
                            selectDepartment(department)
                          }
                        >
                          {selectedDepartment?.name === department.name
                            ? "SELECTED"
                            : department.available === 0
                            ? "CLOSED"
                            : "SELECT"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedDepartment && (
              <div className="selection-box">
                <div>
                  <small>Selected Department</small>
                  <h3>{selectedDepartment.name}</h3>
                  <p>
                    Available seats:{" "}
                    <strong>{selectedDepartment.available}</strong>
                  </p>
                </div>

                <button
                  className="allot-btn"
                  onClick={() => setShowConfirm(true)}
                >
                  ALLOT SEAT
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      {/* CONFIRMATION MODAL */}

      {showConfirm && currentCandidate && selectedDepartment && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Seat Allotment</h2>

            <p>Please verify the details before allotting the seat.</p>

            <div className="modal-details">
              <div>
                <span>Candidate</span>
                <strong>{currentCandidate.name}</strong>
              </div>

              <div>
                <span>Application No.</span>
                <strong>{currentCandidate.appNo}</strong>
              </div>

              <div>
                <span>Department</span>
                <strong>{selectedDepartment.name}</strong>
              </div>

              <div>
                <span>Course Fee</span>
                <strong>₹50,000</strong>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                CANCEL
              </button>

              <button
                className="confirm-btn"
                onClick={confirmAllotment}
              >
                CONFIRM ALLOTMENT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;