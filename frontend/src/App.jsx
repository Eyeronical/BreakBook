import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Employees from './pages/Employees'
import Leaves from './pages/Leaves'
import Balance from './pages/Balance'

export default function App() {
  return (
    <>
      <Navbar />
      <div className="container py-4">
        <Routes>
          <Route path="/" element={<Navigate to="/employees" replace />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="*" element={<div className="alert alert-warning mt-5 text-center">Page not found</div>} />
        </Routes>
      </div>
    </>
  )
}
