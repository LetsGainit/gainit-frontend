import { Link } from "react-router-dom";
import "../css/HomeNavBar.css";

function HomeNavBar() {
  return (
    <nav className="HomeNavBar">
      <div className="Homenavbar-brand">
        <Link to="/">Gainit</Link>
      </div>
      <div className="Homenavbar-links">
        <Link to="/Search-Projects" className="Homenav-link">
          Find Project
        </Link>
        <Link to="/about" className="Homenav-link">
          About
        </Link>
      </div>
    </nav>
  );
}

export default HomeNavBar;
