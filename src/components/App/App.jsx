import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Header from "../Header/Header";
import Home from "../Main/Main";
import Profile from "../Profile/Profile";
import LoginModal from "../LoginModal/LoginModal";
import RegisterModal from "../RegisterModal/RegisterModal";
import ConfirmModal from "../ReleaseModal/ReleaseModal";
import SaveModal from "../SaveModal/SaveModal";
import Footer from "../Footer/Footer";
import { fetchPokemonByName, getPokemonSpecies } from "../../utils/api";
import { fetchEvolutionChain } from "../../utils/api";
import { fetchPokemonWeaknesses } from "../../utils/api";
import { fetchPokemonStrengths } from "../../utils/api";
import { fetchAllPokemonNames } from "../../utils/api";
import { getPokemonData } from "../../utils/api";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";

import "./App.css";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allPokemonNames, setAllPokemonNames] = useState([]);
  const [pokedexList, setPokedexList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [pokemon, setPokemon] = useState(null);
  const [pokemonData, setPokemonData] = useState(null);
  const [species, setSpecies] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModal, setActiveModal] = useState("");
  const [lastSearch, setLastSearch] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [showEvolution, setShowEvolution] = useState(false);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [showAbilities, setShowAbilities] = useState(false);
  const [weaknesses, setWeaknesses] = useState([]);
  const [strengths, setStrengths] = useState([]);
  const [showShiny, setShowShiny] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showReleaseAllModal, setShowReleaseAllModal] = useState(false);
  const [scrollKey, setScrollKey] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [values, setValues] = useState({ email: "", password: "", name: "" });
  const [errors, setErrors] = useState({});

  const resetRegisterForm = () => {
    setValues({ email: "", password: "", name: "" });
  };

  const validateUserInput = ({ email, password }) => {
    const isEmailValid = email.includes("@");
    const isPasswordValid = password.length >= 2;
    setIsValid(isEmailValid && isPasswordValid);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
      if (pathname !== "/") {
        window.scrollTo(0, 0);
      }
    }, [pathname]);

    return null;
  }

  const resultsRef = useRef(null);

  useEffect(() => {
    if (shouldScroll && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
      setShouldScroll(false); // reset scroll flag
    }
  }, [shouldScroll]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevName = pokedexList[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      handleSearch(prevName);
      setShouldScroll(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < pokedexList.length - 1) {
      const nextName = pokedexList[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      handleSearch(nextName);
      setShouldScroll(true);
    }
  };

  useEffect(() => {
    const getNames = async () => {
      const names = await fetchAllPokemonNames();
      setAllPokemonNames(names);
    };
    getNames();
  }, []);

  useEffect(() => {
    const fetchAllPokemonNames = async () => {
      try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1010");
        const data = await res.json();
        const names = data.results.map((p) => p.name.toLowerCase());
        setPokedexList(names);
      } catch (err) {
        console.error("Error fetching Pokédex list:", err);
      }
    };

    fetchAllPokemonNames();
  }, []);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      setLastSearch("");
      setPokemon(null);
      setHasSearched(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem("currentUser");
      setIsLoggedIn(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      return;
    }

    const favoritesKey = `${currentUser.email}_favorites`;
    const savedFavorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
    setFavorites(savedFavorites);
  }, [currentUser]);

  const handleInputChange = (value) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setSuggestions([]);
      return;
    }
    const filtered = allPokemonNames.filter((name) =>
      name.toLowerCase().startsWith(value.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 8));
  };

  const handleSearch = async (input) => {
    let searchTerm;
    let shouldResetInput = false;

    if (typeof input === "string") {
      searchTerm = input;
    } else {
      input.preventDefault();
      searchTerm = query;
      shouldResetInput = true;
    }

    if (!searchTerm) return;

    setShowEvolution(false);
    setEvolutionChain([]);
    setShowAbilities(false);
    setWeaknesses([]);
    setStrengths([]);
    setLoading(true);
    setLastSearch(searchTerm);
    setHasSearched(true);
    setSearchTerm("");

    try {
      const result = await fetchPokemonByName(searchTerm);
      setPokemon(result);
      setScrollKey((prev) => prev + 1);
      setQuery(searchTerm);

      const weaknessData = await fetchPokemonWeaknesses(searchTerm);
      setWeaknesses(weaknessData);

      const strengthData = await fetchPokemonStrengths(searchTerm);
      setStrengths(strengthData);
      setShouldScroll(true);
    } catch (error) {
      console.error("Search failed:", error);
      setPokemon(null);
      setWeaknesses([]);
      setStrengths([]);
    } finally {
      setLoading(false);
      if (shouldResetInput) {
        setQuery("");
      }
    }
  };

  useEffect(() => {
    if (pokemon?.name && pokedexList.length > 0) {
      const index = pokedexList.indexOf(pokemon.name.toLowerCase());
      setCurrentIndex(index !== -1 ? index : null);
    }
  }, [pokemon, pokedexList]);

  const pokemonName = pokemon?.name || "";

  useEffect(() => {
    getPokemonData(pokemonName).then((data) => {
      if (data) setPokemonData(data);
    });
  }, [pokemonName]);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const result = await getPokemonSpecies(pokemonName);
        setSpecies(result);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSpecies();
  }, [pokemonName]);

  const handleShowEvolution = async () => {
    if (!pokemon) return;

    if (showEvolution) {
      setShowEvolution(false);
      return;
    }
    try {
      const evoChain = await fetchEvolutionChain(pokemon.name);
      setEvolutionChain(evoChain);
      setShowEvolution(true);
    } catch {
      setEvolutionChain([]);
      setShowEvolution(false);
    }
  };

  const handleSavePokemon = (pokemonToSave) => {
    if (!currentUser || !pokemonToSave?.name) return;

    const key = `${currentUser.email}_favorites`;
    const existing = JSON.parse(localStorage.getItem(key)) || [];

    const alreadySaved = existing.some((p) => p.name === pokemonToSave.name);
    if (alreadySaved) return alert("You've already saved this Pokémon!");

    const simplifiedData = {
      name: pokemonToSave.name,
      sprite: pokemonToSave.sprites?.front_default || pokemonToSave.imageNormal,
      description: pokemonToSave.description || "No description available.",
      shinySprite: pokemonToSave.sprites?.front_shiny || null,
      isLegendary: pokemonToSave.isLegendary || false,
      isMythical: pokemonToSave.isMythical || false,
    };

    existing.push(simplifiedData);
    localStorage.setItem(key, JSON.stringify(existing));
    setFavorites([...existing]);

    setShowSaveModal(true);
  };

  const handleRelease = (pokemonName) => {
    const updatedFavorites = favorites.filter((p) => p.name !== pokemonName);
    setFavorites(updatedFavorites);

    const key = `${currentUser.email}_favorites`;
    localStorage.setItem(key, JSON.stringify(updatedFavorites));
  };

  const handleClearFavorites = () => {
    if (!currentUser) return;

    const key = `${currentUser.email}_favorites`;
    localStorage.removeItem(key);
    setFavorites([]);
  };

  const suggestionRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setSuggestions]);

  const navigate = useNavigate();

  const handleLogin = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const match = users.find(
      (user) =>
        user.email.trim().toLowerCase() === normalizedEmail &&
        user.password === password
    );
    if (match) {
      setCurrentUser(match);
      console.log("Login successful!");
      navigate("/profile");
      closeAllModals();
    } else {
      alert("Incorrect email or password.");
    }
  };

  const handleRegister = ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const newUser = { name, email: normalizedEmail, password };
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const duplicate = users.find(
      (user) => user.email.trim().toLowerCase() === normalizedEmail
    );

    if (duplicate) {
      alert("A user with this email already exists.");
      return;
    }
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("user", JSON.stringify(newUser));
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    navigate("/profile");
    closeAllModals();
    resetRegisterForm();
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setFavorites([]);
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
    setActiveModal("");
  };

  const closeAllModals = () => setActiveModal("");
  const handleLoginClick = () => setActiveModal("login");
  const handleSignUpClick = () => setActiveModal("register");

  return (
    <>
      <ScrollToTop />
      <div className="page">
        <div className="page__content page__content_type_profile">
          <Header
            onLoginClick={handleLoginClick}
            onSignupClick={handleSignUpClick}
            onSignOut={handleSignOut}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
          />

          <main>
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    query={query}
                    setQuery={setQuery}
                    pokemon={pokemon}
                    loading={loading}
                    showShiny={showShiny}
                    setShowShiny={setShowShiny}
                    handleSearch={handleSearch}
                    evolutionChain={evolutionChain}
                    showEvolution={showEvolution}
                    handleShowEvolution={handleShowEvolution}
                    showAbilities={showAbilities}
                    setShowAbilities={setShowAbilities}
                    weaknesses={weaknesses}
                    strengths={strengths}
                    pokemonData={pokemonData}
                    species={species}
                    currentIndex={currentIndex}
                    setCurrentIndex={setCurrentIndex}
                    pokedexList={pokedexList}
                    handleSave={handleSavePokemon}
                    currentUser={currentUser}
                    lastSearch={lastSearch}
                    searchTerm={searchTerm}
                    handleInputChange={handleInputChange}
                    suggestions={suggestions}
                    setSuggestions={setSuggestions}
                    suggestionRef={suggestionRef}
                    scrollKey={scrollKey}
                    setScrollKey={setScrollKey}
                    handleNext={handleNext}
                    handlePrev={handlePrev}
                    resultsRef={resultsRef}
                    highlightedIndex={highlightedIndex}
                    setHighlightedIndex={setHighlightedIndex}
                    shouldScroll={shouldScroll}
                    setShouldScroll={setShouldScroll}
                    hasMounted={hasMounted}
                    setHasMounted={setHasMounted}
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <Profile
                      currentUser={currentUser}
                      isLoggedIn={isLoggedIn}
                      favorites={favorites}
                      setFavorites={setFavorites}
                      showConfirmModal={showConfirmModal}
                      selectedPokemon={selectedPokemon}
                      setShowConfirmModal={setShowConfirmModal}
                      setSelectedPokemon={setSelectedPokemon}
                      showReleaseAllModal={showReleaseAllModal}
                      setShowReleaseAllModal={setShowReleaseAllModal}
                      handleClearFavorites={handleClearFavorites}
                    />
                  </ProtectedRoute>
                }
              />
            </Routes>

            <RegisterModal
              isOpen={activeModal === "register"}
              onClose={closeAllModals}
              onRegister={handleRegister}
              onLoginClick={handleLoginClick}
              setCurrentUser={setCurrentUser}
              setIsLoggedIn={setIsLoggedIn}
              isValid={isValid}
              setIsValid={setIsValid}
              validateUserInput={validateUserInput}
              values={values}
              setValues={setValues}
              errors={errors}
              setErrors={setErrors}
            />
            <LoginModal
              isOpen={activeModal === "login"}
              onClose={closeAllModals}
              onLogin={handleLogin}
              passwordError={passwordError}
              setPasswordError={setPasswordError}
              onSignupClick={handleSignUpClick}
            />

            <ConfirmModal
              isOpen={showConfirmModal}
              onClose={() => setShowConfirmModal(false)}
              onConfirm={() => {
                handleRelease(selectedPokemon);
                setShowConfirmModal(false);
              }}
              message={`Are you sure you want to release ${selectedPokemon}?`}
            />

            <SaveModal
              isOpen={showSaveModal}
              onClose={() => setShowSaveModal(false)}
            />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default App;
