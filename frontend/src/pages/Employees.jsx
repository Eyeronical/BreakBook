import { useEffect, useState } from 'react'
import api from '../api'

// ... imports same
export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState({ name: '', email: '', department: '', joiningDate: '' })
  const [editId, setEditId] = useState(null) // track editing
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/employees')
      setEmployees(res.data)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form, joiningDate: new Date(form.joiningDate).toISOString() }
      if (editId) {
        await api.put(`/employees/${editId}`, payload)
      } else {
        await api.post('/employees', payload)
      }
      setForm({ name: '', email: '', department: '', joiningDate: '' })
      setEditId(null)
      load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save employee')
    }
  }

  async function startEdit(emp) {
    setForm({
      name: emp.name,
      email: emp.email,
      department: emp.department || '',
      joiningDate: emp.joiningDate.split('T')[0]
    })
    setEditId(emp.id)
  }

  async function remove(id) {
    if (!window.confirm('Delete this employee?')) return
    await api.delete(`/employees/${id}`)
    load()
  }

  return (
    <div className="py-3">
      <h3 className="mb-3">Employees</h3>
      <form className="card card-body mb-4" onSubmit={submit}>
        {/* same form fields */}
        <div className="mt-3">
          <button className="btn btn-primary" disabled={loading}>
            {editId ? 'Update' : 'Add'} Employee
          </button>
          {editId && <button type="button" className="btn btn-secondary ms-2" onClick={() => { setEditId(null); setForm({ name:'', email:'', department:'', joiningDate:'' }) }}>Cancel</button>}
          {error && <span className="text-danger ms-3">{error}</span>}
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Department</th><th>Joining</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>{e.email}</td>
                <td>{e.department || '-'}</td>
                <td>{new Date(e.joiningDate).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-1" onClick={() => startEdit(e)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
