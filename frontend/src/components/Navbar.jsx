import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand fw-bold fs-3" to="/">
          <i className="bi bi-calendar-check me-2"></i>
          BreakBook
        </NavLink>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`} 
                to="/employees"
              >
                <i className="bi bi-people me-1"></i>
                Employees
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`} 
                to="/leaves"
              >
                <i className="bi bi-calendar-event me-1"></i>
                Leaves
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`} 
                to="/balance"
              >
                <i className="bi bi-wallet2 me-1"></i>
                Balance
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
