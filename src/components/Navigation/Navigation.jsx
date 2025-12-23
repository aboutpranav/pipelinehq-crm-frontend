import { Link } from "react-router-dom";
import "./Navigation.css";

const Navigation = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          PipeLineHQ
        </Link>
        <div className="navbar-menu">
          <button className="navbar-link">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
