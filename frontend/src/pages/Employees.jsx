import { useEffect, useState } from 'react'
import api from '../api'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState({ name: '', email: '', department: '', joiningDate: '' })
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/employees')
      setEmployees(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function resetForm() {
    setForm({ name: '', email: '', department: '', joiningDate: '' })
    setEditId(null)
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setSaving(true)
    try {
      if (!form.name || !form.email || !form.joiningDate) {
        setError('Please fill Name, Email and Joining Date')
        return
      }
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department?.trim() || null,
        joiningDate: new Date(form.joiningDate).toISOString()
      }
      if (editId) {
        await api.put(`/employees/${editId}`, payload)
        setNotice('Employee updated')
      } else {
        await api.post('/employees', payload)
        setNotice('Employee added')
      }
      resetForm()
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save employee')
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
    // Scroll to form
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this employee?')) return
    setError('')
    setNotice('')
    try {
      await api.delete(`/employees/${id}`)
      setNotice('Employee deleted')
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to delete employee')
    }
  }

  return (
    <div>
      <h3 className="mb-3">Employees</h3>

      {notice && <div className="alert alert-success py-2">{notice}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <form className="card card-body mb-4" onSubmit={submit}>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Employee name"
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="name@company.com"
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
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Joining Date</label>
            <input
              type="date"
              className="form-control"
              value={form.joiningDate}
              onChange={e => setForm({ ...form, joiningDate: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="mt-3">
          <button className="btn btn-primary" disabled={saving}>
            {editId ? 'Update' : 'Add'} Employee
          </button>
          {editId && (
            <button type="button" className="btn btn-secondary ms-2" onClick={resetForm} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-muted">Loading employees…</div>
          ) : employees.length === 0 ? (
            <div className="text-muted">No employees yet. Add the first one above.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Joining</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.department || '-'}</td>
                      <td>{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '-'}</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-1" onClick={() => startEdit(emp)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => remove(emp.id)}>Delete</button>
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
