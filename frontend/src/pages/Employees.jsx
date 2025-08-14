import { useEffect, useState } from 'react'
import api from '../api'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState({ name: '', email: '', department: '', joiningDate: '' })
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/employees')
      
      if (res.data && res.data.success) {
        setEmployees(Array.isArray(res.data.data) ? res.data.data : [])
      } else {
        setEmployees(Array.isArray(res.data) ? res.data : [])
      }
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function resetForm() {
    setForm({ name: '', email: '', department: '', joiningDate: '' })
    setEditId(null)
    setError('')
    setSuccess('')
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    
    try {
      if (!form.name?.trim() || !form.email?.trim() || !form.joiningDate) {
        setError('Please fill Name, Email and Joining Date')
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(form.email.trim())) {
        setError('Please enter a valid email address')
        return
      }

      const joiningDate = new Date(form.joiningDate)
      if (joiningDate > new Date()) {
        setError('Joining date cannot be in the future')
        return
      }

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        department: form.department?.trim() || null,
        joiningDate: joiningDate.toISOString()
      }
      
      if (editId) {
        await api.put(`/employees/${editId}`, payload)
        setSuccess('Employee updated successfully')
      } else {
        await api.post('/employees', payload)
        setSuccess('Employee added successfully')
      }
      
      resetForm()
      await load()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      if (e?.response?.status === 409) {
        setError('An employee with this email address already exists. Please use a different email.')
      } else if (e?.response?.status === 400) {
        setError(e?.response?.data?.error || 'Please check your input and try again')
      } else {
        setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to save employee')
      }
    } finally {
      setSaving(false)
    }
  }

  function startEdit(emp) {
    setEditId(emp.id)
    setForm({
      name: emp.name || '',
      email: emp.email || '',
      department: emp.department || '',
      joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : ''
    })
    setError('')
    setSuccess('')
    
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function remove(id, employeeName) {
    if (!window.confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) return
    
    setError('')
    setSuccess('')
    
    try {
      await api.delete(`/employees/${id}`)
      setSuccess('Employee deleted successfully')
      await load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to delete employee')
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Employee Management</h3>
        <span className="badge bg-secondary">{employees.length} employees</span>
      </div>

      {success && <div className="alert alert-success py-2 mb-3">{success}</div>}
      {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

      <form className="card card-body mb-4" onSubmit={submit}>
        <h5 className="card-title mb-3">
          {editId ? 'Edit Employee' : 'Add New Employee'}
        </h5>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Name *</label>
            <input
              className="form-control"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              maxLength={100}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="name@company.com"
              maxLength={150}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Department</label>
            <input
              className="form-control"
              value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })}
              placeholder="e.g. Engineering"
              maxLength={100}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Joining Date *</label>
            <input
              type="date"
              className="form-control"
              value={form.joiningDate}
              onChange={e => setForm({ ...form, joiningDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>
        <div className="mt-3 d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                {editId ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>{editId ? 'Update' : 'Add'} Employee</>
            )}
          </button>
          {editId && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={resetForm} 
              disabled={saving}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Employee List</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm me-2"></div>
              Loading employees...
            </div>
          ) : employees.length === 0 ? (
            <div className="text-muted text-center py-3">
              No employees found. Add the first employee using the form above.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Joining Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(emp => (
                    <tr key={emp.id}>
                      <td className="fw-medium">{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.department || <span className="text-muted">-</span>}</td>
                      <td>
                        {emp.joiningDate ? 
                          new Date(emp.joiningDate).toLocaleDateString() : 
                          <span className="text-muted">-</span>
                        }
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-sm btn-warning" 
                            onClick={() => startEdit(emp)}
                            title="Edit employee"
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => remove(emp.id, emp.name)}
                            title="Delete employee"
                          >
                            Delete
                          </button>
                        </div>
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
