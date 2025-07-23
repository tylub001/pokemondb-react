import { Link, useLocation } from "react-router-dom";
import homeIcon from "../../images/home-icon-white2.svg";
import myPokemonIcon from "../../images/mypokeball-icon.svg";
import logoutIcon from "../../images/logout-icon.svg";
import "./Header.css";

const Header = ({ onLoginClick, onSignOut, isLoggedIn, currentUser }) => {
  const location = useLocation();
  const isProfileRoute = location.pathname === "/profile";
  return (
    <header className={`header ${isLoggedIn ? "header--logged-in" : ""}`}>
      <div className="logo__container">
        <span className="header__logo">POKÉMON</span>
        <span className="header__logo-arial">DB</span>
      </div>
      <nav className="header__nav">
        {!isLoggedIn && (
          <>
            <Link to="/" className="nav__home">
              Home
            </Link>
            <button className="nav__login" onClick={onLoginClick}>
              Login
            </button>
          </>
        )}

        {isLoggedIn && (
          <>
            <Link to="/" className="nav__home">
              Home
            </Link>
            <Link to="/profile" className="nav__favorites">
              <span className="nav__my">MY</span>
        <span>pokemon</span>
            </Link>
            <button className="nav__logout" onClick={onSignOut}>
              Logout
            </button>

            {/* Icons for mobile */}
            <Link to="/" className="nav__icon-wrapper">
              <img src={homeIcon} alt="Home" className="profile__icon" />
            </Link>
            <Link to="/profile" className="nav__icon-wrapper">
              <img
                src={myPokemonIcon}
                alt="My Pokémon"
                className="profile__icon"
              />
            </Link>
            <button className="nav__icon-wrapper" onClick={onSignOut}>
              <img src={logoutIcon} alt="Logout" className="profile__icon" />
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
