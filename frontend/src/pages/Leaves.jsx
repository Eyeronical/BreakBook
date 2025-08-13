import { useEffect, useState } from 'react'
import api from '../api'

export default function Leaves() {
  const [employees, setEmployees] = useState([])
  const [leaves, setLeaves] = useState([])
  const [form, setForm] = useState({ employeeId: '', startDate: '', endDate: '', reason: '' })
  const [error, setError] = useState('')

  async function loadEmployees() {
    const res = await api.get('/employees')
    setEmployees(res.data)
    if (res.data.length) setForm(f => ({ ...f, employeeId: res.data[0].id }))
  }

  async function loadLeaves() {
    const res = await api.get('/leaves')
    setLeaves(res.data)
  }

  useEffect(() => { loadEmployees(); loadLeaves() }, [])

  async function apply(e) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/leaves', {
        employeeId: form.employeeId,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        reason: form.reason
      })
      setForm({ ...form, startDate: '', endDate: '', reason: '' })
      loadLeaves()
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to apply leave')
    }
  }

  async function approve(id) {
    await api.post(`/leaves/${id}/approve`, { approverId: 'HR1', remarks: 'Approved' })
    loadLeaves()
  }

  async function reject(id) {
    await api.post(`/leaves/${id}/reject`, { approverId: 'HR1', remarks: 'Rejected' })
    loadLeaves()
  }

  return (
    <div className="py-3">
      <h3 className="mb-3">Leaves</h3>
      <form className="card card-body mb-4" onSubmit={apply}>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Employee</label>
            <select className="form-select" value={form.employeeId} onChange={e=>setForm({...form,employeeId:e.target.value})}>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Start</label>
            <input type="date" className="form-control" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} required />
          </div>
          <div className="col-md-2">
            <label className="form-label">End</label>
            <input type="date" className="form-control" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})} required />
          </div>
          <div className="col-md-3">
            <label className="form-label">Reason</label>
            <input className="form-control" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className="btn btn-primary w-100">Apply</button>
          </div>
        </div>
        {error && <div className="text-danger mt-2">{error}</div>}
      </form>
      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr><th>Employee</th><th>Dates</th><th>Days</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {leaves.map(l => (
              <tr key={l.id}>
                <td>{l.employee?.name || l.employeeId}</td>
                <td>{new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}</td>
                <td>{l.daysRequested}</td>
                <td>
                  <span className={`badge text-bg-${l.status === 'APPROVED' ? 'success' : l.status === 'REJECTED' ? 'danger' : 'secondary'}`}>
                    {l.status}
                  </span>
                </td>
                <td>
                  {l.status === 'PENDING'
                    ? <>
                        <button className="btn btn-sm btn-success me-1" onClick={() => approve(l.id)}>Approve</button>
                        <button className="btn btn-sm btn-danger" onClick={() => reject(l.id)}>Reject</button>
                      </>
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
