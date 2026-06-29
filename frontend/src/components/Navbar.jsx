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
          LG <span>Prime</span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`} />
        </button>

        <ul
          className={`nav-links ${menuOpen ? "open" : ""}`}
        >
          <li>
            <a href="#markets" onClick={() => setMenuOpen(false)}>
              Markets
            </a>
          </li>
          <li>
            <a href="#products" onClick={() => setMenuOpen(false)}>
              Products
            </a>
          </li>
          <li>
            <a href="#benefits" onClick={() => setMenuOpen(false)}>
              Why Us
            </a>
          </li>
          <li>
            <a href="#academy" onClick={() => setMenuOpen(false)}>
              Academy
            </a>
          </li>
        </ul>

        <div
          className={`nav-actions ${menuOpen ? "open" : ""}`}
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
