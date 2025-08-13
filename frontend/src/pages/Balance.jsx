import { useEffect, useState } from 'react'
import api from '../api'

export default function Balance() {
  const [employees, setEmployees] = useState([])
  const [selected, setSelected] = useState('')
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/employees').then(res => {
      setEmployees(res.data)
      if (res.data.length) setSelected(res.data[0].id)
    })
  }, [])

  async function fetchBalance() {
    setError('')
    try {
      const res = await api.get(`/employees/${selected}/leave-balance`)
      setBalance(res.data)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to fetch balance')
    }
  }

  return (
    <div className="py-3">
      <h3 className="mb-3">Leave Balance</h3>
      <div className="card card-body mb-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-6">
            <label className="form-label">Employee</label>
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
          <div className="col-md-3">
            <button className="btn btn-primary" onClick={fetchBalance}>Get Balance</button>
          </div>
          {error && <div className="col-12 text-danger">{error}</div>}
        </div>
      </div>

      {balance && (
        <div className="card card-body text-center">
          <div className="row">
            <div className="col">
              <h5>{balance.accrued?.toFixed(1)}</h5><small>Accrued</small>
            </div>
            <div className="col">
              <h5>{balance.approvedDays}</h5><small>Approved</small>
            </div>
            <div className="col">
              <h5>{balance.pendingDays}</h5><small>Pending</small>
            </div>
            <div className="col">
              <h5>{balance.available?.toFixed(1)}</h5><small>Available</small>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
