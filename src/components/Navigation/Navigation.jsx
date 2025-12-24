import { Link } from "react-router-dom";
import "./Navigation.css";

const Navigation = ({ toggleSidebar }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button className="navbar-hamburger" onClick={toggleSidebar}>
          ☰
        </button>
        <Link to="/" className="navbar-brand">
          PipeLineHQ
        </Link>
        {/* <div className="navbar-menu">
          <button className="navbar-link">Logout</button>
        </div> */}
      </div>
    </nav>
  );
};

export default Navigation;
