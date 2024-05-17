import React from "react";

function FilterSuggestionBox({
  suggestions,
  setSuggestions,
  setSelectedSuggestions,
  setSearchQuery,
  elementRef,
}) {
  if (suggestions.length === 0) return null;

  const position = elementRef?.current?.getBoundingClientRect();
  const { left, bottom } = position;

  const handleSuggestionClick = (e) => {
    console.log(e.target.innerText);
    setSelectedSuggestions((prev) => [...prev, e.target.innerText]);
    setSuggestions([]);
    setSearchQuery("");
  };

  return (
    <ul style={{ left: left, top: bottom }} className="filter-suggestion-box">
      {suggestions?.map((suggestion) => (
        <li onClick={handleSuggestionClick} key={suggestion}>
          {suggestion}
        </li>
      ))}
    </ul>
  );
}

export default FilterSuggestionBox;
