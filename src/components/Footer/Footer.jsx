import { Link } from "react-router-dom";
import "./Footer.css";
import githubIcon from "../../images/github.svg";
import facebookIcon from "../../images/facebook.svg";

const Footer = () => {
  return (
    <footer className="author-footer">
      <div className="footer__wrapper">
        <div className="author-footer__content">
          <div
            className="footer__image"
            role="img"
            aria-label="Author portrait"
          ></div>
          <div className="footer__text">
            <h4 className="footer__heading">About the Author</h4>
            <p className="footer__description">
              Brittany Tylutke is a passionate frontend developer who blends
              technical precision with creative vision. She specializes in
              building polished, user-friendly web applications with React, and
              thrives on crafting modular, scalable components that elevate user
              experience. Whether she's refining UI details or architecting
              reusable utilities, Brittany brings persistence, adaptability, and
              a love for clean code to every project.
            </p>
          </div>
        </div>
        <div className="footer__container">
          <nav className="footer__nav">
            <div className="nav__text">
              <Link to="/" className="nav__link-footer">
                Home
              </Link>
              <button className="nav__link-footer">TripleTen</button>
            </div>
            <div className="nav__icon">
              <a
                href="https://www.facebook.com/brittany.tylutke"
                className="nav__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={facebookIcon}
                  alt="GitHub"
                  className="nav__icon-facebook"
                />
              </a>

              <a
                href="https://github.com/tylub001"
                className="nav__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={githubIcon}
                  alt="Facebook"
                  className="nav__icon-github"
                />
              </a>
            </div>
          </nav>
        </div>
        <p className="footer__name">
          &copy; 2025 Supersite, Powered by PokeApi{" "}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
