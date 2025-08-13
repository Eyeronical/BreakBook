import { useEffect, useState } from 'react'
import api from '../api'

export default function Balance() {
  const [employees, setEmployees] = useState([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Load list of employees
  async function loadEmployees() {
    setError('')
    try {
      const res = await api.get('/employees')
      setEmployees(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load employees')
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  // Fetch balance when employee changes
  async function fetchBalance(id) {
    if (!id) {
      setBalance(null)
      return
    }
    setLoading(true)
    setError('')
    setBalance(null)
    try {
      const res = await api.get(`/employees/${id}/leave-balance`)
      setBalance(res.data)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load balance')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance(selectedEmployeeId)
  }, [selectedEmployeeId])

  return (
    <div className="py-3">
      <h3 className="mb-3">Leave Balance</h3>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* Employee selection */}
      <div className="card mb-3">
        <div className="card-body">
          <label className="form-label">Select Employee</label>
          <select
            className="form-select"
            value={selectedEmployeeId}
            onChange={e => setSelectedEmployeeId(e.target.value)}
            required
          >
            <option value="">Select Employee</option>
            {employees
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Balance display */}
      <div className="card">
        <div className="card-body">
          {!selectedEmployeeId ? (
            <div className="text-muted">Pick an employee to view balance.</div>
          ) : loading ? (
            <div className="text-muted">Loading balance…</div>
          ) : balance ? (
            <div className="row g-3">
              <div className="col-md-3">
                <div className="border p-3 text-center">
                  <div className="fw-bold fs-5">{balance.accrued}</div>
                  <div className="text-muted">Accrued Days</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border p-3 text-center">
                  <div className="fw-bold fs-5">{balance.approvedDays}</div>
                  <div className="text-muted">Approved Days</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border p-3 text-center">
                  <div className="fw-bold fs-5">{balance.pendingDays}</div>
                  <div className="text-muted">Pending Days</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border p-3 text-center">
                  <div className="fw-bold fs-5">{balance.available}</div>
                  <div className="text-muted">Available Days</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted">No balance data available.</div>
          )}
        </div>
      </div>
    </div>
  )
}
