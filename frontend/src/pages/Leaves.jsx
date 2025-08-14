import { useEffect, useState } from 'react'
import api from '../api'

export default function Leaves() {
  const [employees, setEmployees] = useState([])
  const [leaves, setLeaves] = useState([])
  const [form, setForm] = useState({ employeeId: '', startDate: '', endDate: '', reason: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadEmployees() {
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
      console.log('Employees set:', employeeData); 
      

      if (employeeData.length && !form.employeeId) {
        setForm(f => ({ ...f, employeeId: employeeData[0].id }))
      }
    } catch (e) {
      console.error('Error loading employees:', e);
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to load employees')
    }
  }

  async function loadLeaves() {
    setLoading(true)
    try {
      const res = await api.get('/leaves')
      console.log('Leaves loaded:', res.data);
      
      if (res.data && res.data.success) {
        setLeaves(Array.isArray(res.data.data) ? res.data.data : [])
      } else {
        setLeaves(Array.isArray(res.data) ? res.data : [])
      }
    } catch (e) {
      console.error('Error loading leaves:', e);
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to load leaves')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    loadEmployees()
    loadLeaves() 
  }, [])

  async function apply(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!form.employeeId || !form.startDate || !form.endDate) {
      setError('Please fill all required fields')
      return
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('End date cannot be before start date')
      return
    }

    try {
      await api.post('/leaves', {
        employeeId: form.employeeId,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        reason: form.reason.trim() || ''
      })
      setForm({ ...form, startDate: '', endDate: '', reason: '' })
      setSuccess('Leave request submitted successfully')
      await loadLeaves()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to apply leave')
    }
  }

  async function approve(id) {
    try {
      await api.post(`/leaves/${id}/approve`, {})
      setSuccess('Leave request approved')
      await loadLeaves()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to approve leave')
    }
  }

  async function reject(id) {
    if (!window.confirm('Are you sure you want to reject this leave request?')) return
    
    try {
      await api.post(`/leaves/${id}/reject`, {})
      setSuccess('Leave request rejected')
      await loadLeaves()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to reject leave')
    }
  }

  return (
    <div className="py-3">
      <h3 className="mb-4">Leave Management</h3>
      
      {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
      {success && <div className="alert alert-success py-2 mb-3">{success}</div>}
      
      <form className="card card-body mb-4" onSubmit={apply}>
        <h5 className="card-title mb-3">Apply for Leave</h5>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Employee *</label>
            <select
              className="form-select"
              value={form.employeeId}
              onChange={e => setForm({ ...form, employeeId: e.target.value })}
              required
            >
              <option value="">Select Employee</option>
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
          <div className="col-md-2">
            <label className="form-label">Start Date *</label>
            <input 
              type="date" 
              className="form-control" 
              value={form.startDate} 
              onChange={e => setForm({...form, startDate: e.target.value})} 
              min={new Date().toISOString().split('T')[0]}
              required 
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">End Date *</label>
            <input 
              type="date" 
              className="form-control" 
              value={form.endDate} 
              onChange={e => setForm({...form, endDate: e.target.value})} 
              min={form.startDate || new Date().toISOString().split('T')[0]}
              required 
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Reason</label>
            <input 
              className="form-control" 
              value={form.reason} 
              onChange={e => setForm({...form, reason: e.target.value})}
              placeholder="Optional reason"
              maxLength={200}
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button type="submit" className="btn btn-primary w-100">
              Apply Leave
            </button>
          </div>
        </div>
      </form>
      
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Leave Requests</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm me-2"></div>
              Loading leaves...
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-muted text-center py-3">No leave requests found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle mb-0">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(l => (
                    <tr key={l.id}>
                      <td>
                        <div className="fw-medium">{l.employee?.name || 'Unknown'}</div>
                        <small className="text-muted">{l.employee?.email || l.employeeId}</small>
                      </td>
                      <td>
                        <div>{new Date(l.startDate).toLocaleDateString()}</div>
                        <div className="text-muted">to {new Date(l.endDate).toLocaleDateString()}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">{l.daysRequested} days</span>
                      </td>
                      <td>
                        <span className="text-truncate d-inline-block" style={{maxWidth: '150px'}} title={l.reason}>
                          {l.reason || '-'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge text-bg-${
                          l.status === 'APPROVED' ? 'success' : 
                          l.status === 'REJECTED' ? 'danger' : 
                          l.status === 'CANCELLED' ? 'secondary' :
                          'warning'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td>
                        {l.status === 'PENDING' ? (
                          <div className="btn-group" role="group">
                            <button 
                              className="btn btn-sm btn-success" 
                              onClick={() => approve(l.id)}
                              title="Approve leave"
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-sm btn-danger" 
                              onClick={() => reject(l.id)}
                              title="Reject leave"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
