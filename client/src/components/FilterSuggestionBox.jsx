import React from "react";

function FilterSuggestionBox({
  suggestions,
  setSuggestions,
  setSelectedSuggestions,
  setSearchQuery,
  elementRef,
  activeSuggestionIndex,
  inputRef,
}) {
  if (suggestions.length === 0) return null;

  const position = elementRef?.current?.getBoundingClientRect();
  const { left, bottom } = position;

  const handleSuggestionClick = (e) => {
    setSelectedSuggestions((prev) => [...prev, e.target.innerText]);
    setSuggestions([]);
    setSearchQuery("");
    inputRef.current.focus();
  };

  return (
    <ul style={{ left: left, top: bottom }} className="filter-suggestion-box">
      {suggestions?.map((suggestion, index) => (
        <li
          id={`suggestion-${index}`}
          className={index === activeSuggestionIndex ? "active" : ""}
          onClick={handleSuggestionClick}
          key={suggestion}
        >
          {suggestion}
        </li>
      ))}
    </ul>
  );
}

export default FilterSuggestionBox;
