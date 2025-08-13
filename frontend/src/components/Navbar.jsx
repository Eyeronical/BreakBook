import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <NavLink className="navbar-brand" to="/">BreakBook</NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div id="nav" className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><NavLink className="nav-link" to="/employees">Employees</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/leaves">Leaves</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/balance">Balance</NavLink></li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
