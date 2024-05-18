import { useRef, useEffect } from "react";

function FilterSuggestionBox({
  suggestions,
  setSuggestions,
  setSelectedSuggestions,
  setSearchQuery,
  elementRef,
  activeSuggestionIndex,
  inputRef,
  type,
}) {
  // if (suggestions.length === 0) return null;
  // if (!inputRef.current?.value) return null;

  const ulRef = useRef(null);
  // const filterBoxDimensions = elementRef.current?.getBoundingClientRect();
  // const { left, bottom } = filterBoxDimensions;

  useEffect(() => {
    const filterBoxDimensions = elementRef?.current?.getBoundingClientRect();
    const { left, bottom } = filterBoxDimensions;

    if (ulRef.current) {
      ulRef.current.style.left = `${left}px`;
      ulRef.current.style.top = `${bottom}px`;
    }
  }, [suggestions, elementRef]);

  const handleSuggestionClick = (e) => {
    if (e.target.innerText.toLowerCase() === "nothing found") return;
    setSelectedSuggestions((prev) => [...prev, e.target.innerText]);
    setSuggestions([]);
    setSearchQuery("");
    inputRef.current.focus();
  };

  return (
    <ul ref={ulRef} className="filter-suggestion-box">
      {suggestions?.map((suggestion, index) => (
        <li
          id={`${type}-suggestion-${index}`}
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
