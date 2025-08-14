import { useEffect, useState } from 'react'
import api from '../api'

export default function Balance() {
  const [employees, setEmployees] = useState([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [newBalance, setNewBalance] = useState('')
  
  async function loadEmployees() {
    setError('')
    try {
      const res = await api.get('/employees')
      console.log('Employees loaded:', res.data);
      
      let employeeData = [];
      if (res.data && res.data.success) {
        employeeData = Array.isArray(res.data.data) ? res.data.data : [];
      } else {
        employeeData = Array.isArray(res.data) ? res.data : [];
      }
      
      setEmployees(employeeData);
      console.log('Employees set in balance page:', employeeData);
    } catch (e) {
      console.error('Error loading employees in balance page:', e);
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to load employees')
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  async function fetchBalance(id) {
    if (!id) {
      setBalance(null)
      setNewBalance('')
      return
    }
    setLoading(true)
    setError('')
    setBalance(null)
    try {
      const res = await api.get(`/employees/${id}/leave-balance`)
      console.log('Balance loaded:', res.data); 
      
      let balanceData = null;
      if (res.data && res.data.success) {
        balanceData = res.data.data;
      } else {
        balanceData = res.data;
      }
      
      setBalance(balanceData)
      setNewBalance(balanceData?.allocated?.toString() || balanceData?.accrued?.toString() || '')
    } catch (e) {
      console.error('Error loading balance:', e); 
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to load balance')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance(selectedEmployeeId)
  }, [selectedEmployeeId])

  async function updateBalance(e) {
    e.preventDefault()
    if (!selectedEmployeeId || !newBalance) return
    
    const balanceValue = parseInt(newBalance)
    if (isNaN(balanceValue) || balanceValue < 0) {
      setError('Please enter a valid number of days (0 or more)')
      return
    }

    setUpdating(true)
    setError('')
    
    try {
      await api.patch(`/employees/${selectedEmployeeId}/leave-balance`, {
        balance: balanceValue
      })
      await fetchBalance(selectedEmployeeId)
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to update balance')
    } finally {
      setUpdating(false)
    }
  }

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId)

  return (
    <div className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Leave Balance Management</h3>
      </div>

      {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Select Employee</h5>
          <div className="row g-3 align-items-end">
            <div className="col-md-8">
              <label className="form-label">Employee</label>
              <select
                className="form-select"
                value={selectedEmployeeId}
                onChange={e => setSelectedEmployeeId(e.target.value)}
              >
                <option value="">Choose an employee...</option>
                {employees.length > 0 ? (
                  employees
                    .filter(emp => emp && emp.id && emp.name) 
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.email})
                      </option>
                    ))
                ) : (
                  <option disabled>No employees available</option>
                )}
              </select>
              {employees.length === 0 && (
                <small className="text-muted">
                  No employees found. Please add employees first.
                </small>
              )}
            </div>
            {selectedEmployee && (
              <div className="col-md-4">
                <div className="text-muted">
                  <small>
                    Joined: {new Date(selectedEmployee.joiningDate).toLocaleDateString()}
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedEmployeeId && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Current Balance</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm me-2"></div>
                Loading balance information...
              </div>
            ) : balance ? (
              <>
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="border rounded p-3 text-center bg-light">
                      <div className="fw-bold fs-4 text-primary">{balance.allocated || balance.accrued || 0}</div>
                      <div className="text-muted small">Total Allocated</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded p-3 text-center">
                      <div className="fw-bold fs-4 text-success">{balance.used || balance.approvedDays || 0}</div>
                      <div className="text-muted small">Days Used</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded p-3 text-center">
                      <div className="fw-bold fs-4 text-warning">{balance.pending || balance.pendingDays || 0}</div>
                      <div className="text-muted small">Pending Requests</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded p-3 text-center bg-light">
                      <div className="fw-bold fs-4 text-info">{balance.available || 0}</div>
                      <div className="text-muted small">Available Days</div>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={updateBalance}>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                      <label className="form-label">Update Total Allocation</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newBalance}
                        onChange={e => setNewBalance(e.target.value)}
                        min="0"
                        max="365"
                        placeholder="Enter days"
                      />
                    </div>
                    <div className="col-md-3">
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100"
                        disabled={updating || !newBalance}
                      >
                        {updating ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Updating...
                          </>
                        ) : (
                          'Update Balance'
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="form-text">
                    This will set the total annual leave allocation for this employee.
                  </div>
                </form>
              </>
            ) : (
              <div className="text-muted text-center py-3">
                No balance information available for this employee.
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedEmployeeId && (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="text-muted">
              <div className="fs-1 mb-3">👤</div>
              <p>Select an employee above to view and manage their leave balance.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
