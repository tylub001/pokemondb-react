import "./Preloader.css";

function Preloader() {
  return (
    <div className="preloader fade-in">
      <div className="pokeball-spinner"></div>
      <p className="preloader__text">Loading your Pokémon...</p>
    </div>
  );
}

export default Preloader;