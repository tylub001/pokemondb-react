import "./SearchForm.css";

function SearchForm({
  searchTerm,
  handleInputChange,
  handleSearch,
  suggestions,
  setSuggestions,
  suggestionRef,
  highlightedIndex,
  setHighlightedIndex,
}) {
  return (
    <form
      className="form__search"
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch(searchTerm);
      }}
    >
      <input
        className="home__input"
        type="text"
        value={searchTerm}
        onChange={(e) => {
          handleInputChange(e.target.value);
          setHighlightedIndex(-1);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            setHighlightedIndex((prev) =>
              Math.min(prev + 1, suggestions.length - 1)
            );
          } else if (e.key === "ArrowUp") {
            setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          } else if (e.key === "Enter" && highlightedIndex >= 0) {
            e.preventDefault();
            handleSearch(suggestions[highlightedIndex]);
            setSuggestions([]);
          }
        }}
        placeholder="Search Pokémon"
      />

      <button className="home__submit" type="submit">
        Search
      </button>
      {suggestions.length > 0 && (
        <ul className="suggestion-list" ref={suggestionRef}>
          {suggestions.map((name, index) => (
            <li
              className={`suggestion-item ${
                index === highlightedIndex ? "highlighted" : ""
              }`}
              key={name}
              onMouseDown={(e) => {
                e.preventDefault();
                setSuggestions([]);
                handleSearch(name);
              }}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

export default SearchForm;
