import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Navbar({ theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <i className="fa-solid fa-chart-line logo-icon" />
          TG <span>Prime</span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          <i className="fa-solid fa-bars" />
        </button>

        <ul
          className="nav-links"
          style={{ display: menuOpen ? "flex" : undefined }}
          onClick={() => setMenuOpen(false)}
        >
          <li>
            <a href="#markets">Markets</a>
          </li>
          <li>
            <a href="#products">Products</a>
          </li>
          <li>
            <a href="#benefits">Why Us</a>
          </li>
          <li>
            <a href="#academy">Academy</a>
          </li>
        </ul>

        <div
          className="nav-actions"
          style={
            menuOpen
              ? { display: "flex", flexDirection: "column", gap: "1rem" }
              : undefined
          }
        >
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            <i
              className={`fa-solid ${
                theme === "light" ? "fa-moon" : "fa-sun"
              }`}
            />
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
          <Link
            to="/login"
            className="btn-text"
            onClick={() => setMenuOpen(false)}
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="btn-primary"
            onClick={() => setMenuOpen(false)}
          >
            Create Account
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
