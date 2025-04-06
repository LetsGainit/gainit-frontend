import { Link } from "react-router-dom";
import '../css/NavigatorBar.css';

function NavBar() {
    return ( 
    <nav className="NavBar">
        <div className="navbar-brand">
            <Link to="/">Gainit</Link>
        </div>
        <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/Search-Project" className="nav-link">Find Project</Link>
        </div>
    </nav>
    );
}

export default NavBar