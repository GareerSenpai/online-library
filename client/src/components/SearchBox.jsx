import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { IoSearch } from "react-icons/io5";
import { fetchGenreURL, fetchAuthorURL } from "../backend_api_urls.js";
import FilterButton from "./FilterButton.jsx";
import FilterSuggestionBox from "./FilterSuggestionBox.jsx";
import Tag from "./Tag.jsx";

function SearchBox() {
  const [includeAllGenres, setIncludeAllGenres] = useState(false);
  const [includeAllAuthors, setIncludeAllAuthors] = useState(false);
  const [showFilterBox, setShowFilterBox] = useState(false);
  const [genreSuggestions, setGenreSuggestions] = useState([]);
  const [authorSuggestions, setAuthorSuggestions] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [genreSearchQuery, setGenreSearchQuery] = useState("");
  const [authorSearchQuery, setAuthorSearchQuery] = useState("");
  const [activeGenreSuggestionIndex, setActiveGenreSuggestionIndex] =
    useState(0);
  const [activeAuthorSuggestionIndex, setActiveAuthorSuggestionIndex] =
    useState(0);

  const genreSearchBoxRef = useRef(null);
  const authorSearchBoxRef = useRef(null);
  const genreInputRef = useRef(null);
  const authorInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = () => {
      setGenreSuggestions([]);
      setAuthorSuggestions([]);
    };

    // Add event listener to document to handle clicks outside
    document.addEventListener("click", handleClickOutside);

    return () => {
      // Clean up event listener on component unmount
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  const fetchFilterSuggestions = async (query, type) => {
    let url = "";
    if (type === "genre") {
      url = fetchGenreURL;
    } else if (type === "author") {
      url = fetchAuthorURL;
    }

    const res = await axios.get(url, { params: { [type]: query } });

    if (type === "genre") {
      let filteredGenres = res?.data.data.genres.filter(
        (genre) => !selectedGenres.includes(genre)
      );
      if (filteredGenres.length === 0) {
        filteredGenres = ["Nothing found"];
      }
      setGenreSuggestions(filteredGenres);
    } else if (type === "author") {
      let filteredAuthors = res?.data.data.authors.filter(
        (author) => !selectedAuthors.includes(author)
      );
      if (filteredAuthors.length === 0) {
        filteredAuthors = ["Nothing found", ...filteredAuthors];
      }
      setAuthorSuggestions(filteredAuthors);
    }
  };

  const handleFilterChange = debounce((e) => {
    const type = e.target.name;
    const query = e.target.value;

    if (!query) {
      if (type === "genre") {
        setGenreSuggestions([]);
      } else if (type === "author") {
        setAuthorSuggestions([]);
      }
      return;
    }

    fetchFilterSuggestions(query, type);
  }, 300);

  const handleKeyboardNavigation = (
    e,
    {
      type,
      activeSuggestionIndex,
      setActiveSuggestionIndex,
      suggestions,
      setSuggestions,
      setSelectedSuggestions,
      searchQuery,
      setSearchQuery,
    }
  ) => {
    if (suggestions.length > 0) {
      if (e.key === "Enter") {
        const newSelectedSuggestion = suggestions[activeSuggestionIndex];
        if (newSelectedSuggestion.toLowerCase() === "nothing found") return;
        setSelectedSuggestions((prev) => [...prev, newSelectedSuggestion]);
        setActiveSuggestionIndex(0);
        setSuggestions([]);
        setSearchQuery("");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : prev;
          document
            .getElementById(`${type}-suggestion-${newIndex}`)
            .scrollIntoView({ block: "nearest" });
          return newIndex;
        });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => {
          const newIndex = prev < suggestions.length - 1 ? prev + 1 : prev;
          document
            .getElementById(`${type}-suggestion-${newIndex}`)
            .scrollIntoView({ block: "nearest" });
          return newIndex;
        });
      }
    } else if (e.key === "Backspace" && !searchQuery) {
      setSelectedSuggestions((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="search-box">
      <div className="search-field">
        <input type="text" placeholder="Search for any book..." />
        <FilterButton
          showFilterBox={showFilterBox}
          setShowFilterBox={setShowFilterBox}
        />
        <IoSearch className="search-icon" />
      </div>
      <div className={`filter-box ${showFilterBox ? "open" : ""}`}>
        <div className="filter-field">
          <div className="filter-type">
            <label htmlFor="genre">Genre : </label>
            <div className="input-box" ref={genreSearchBoxRef}>
              {selectedGenres.map((genre) => (
                <Tag
                  key={genre}
                  tagName={genre}
                  removeSelected={(data) =>
                    setSelectedGenres((prev) => {
                      genreInputRef.current.focus();
                      return prev.filter((genre) => genre !== data);
                    })
                  }
                />
              ))}
              <input
                ref={genreInputRef}
                name="genre"
                type="text"
                value={genreSearchQuery}
                onKeyDown={(e) =>
                  handleKeyboardNavigation(e, {
                    type: "genre",
                    activeSuggestionIndex: activeGenreSuggestionIndex,
                    setActiveSuggestionIndex: setActiveGenreSuggestionIndex,
                    suggestions: genreSuggestions,
                    setSuggestions: setGenreSuggestions,
                    setSelectedSuggestions: setSelectedGenres,
                    searchQuery: genreSearchQuery,
                    setSearchQuery: setGenreSearchQuery,
                  })
                }
                onChange={(e) => {
                  setGenreSearchQuery(e.target.value);
                  handleFilterChange(e);
                }}
                autoComplete="off"
              />
            </div>
            {genreSuggestions.length > 0 && (
              <FilterSuggestionBox
                suggestions={genreSuggestions}
                setSuggestions={setGenreSuggestions}
                setSelectedSuggestions={setSelectedGenres}
                setSearchQuery={setGenreSearchQuery}
                activeSuggestionIndex={activeGenreSuggestionIndex}
                elementRef={genreSearchBoxRef}
                inputRef={genreInputRef}
                type="genre"
              />
            )}
          </div>
          <p>
            Include{" "}
            <button
              className={includeAllGenres ? "clicked" : ""}
              onClick={() => setIncludeAllGenres(true)}
            >
              all
            </button>{" "}
            /{" "}
            <button
              className={!includeAllGenres ? "clicked" : ""}
              onClick={() => setIncludeAllGenres(false)}
            >
              either
            </button>
          </p>
        </div>
        <div className="filter-field">
          <div className="filter-type">
            <label htmlFor="author">Author : </label>
            <div className="input-box" ref={authorSearchBoxRef}>
              {selectedAuthors.map((author) => (
                <Tag
                  key={author}
                  tagName={author}
                  removeSelected={(data) =>
                    setSelectedAuthors((prev) => {
                      authorInputRef.current.focus();
                      return prev.filter((author) => author !== data);
                    })
                  }
                />
              ))}
              <input
                ref={authorInputRef}
                name="author"
                type="text"
                value={authorSearchQuery}
                onKeyDown={(e) =>
                  handleKeyboardNavigation(e, {
                    type: "author",
                    activeSuggestionIndex: activeAuthorSuggestionIndex,
                    setActiveSuggestionIndex: setActiveAuthorSuggestionIndex,
                    suggestions: authorSuggestions,
                    setSuggestions: setAuthorSuggestions,
                    setSelectedSuggestions: setSelectedAuthors,
                    searchQuery: authorSearchQuery,
                    setSearchQuery: setAuthorSearchQuery,
                  })
                }
                onChange={(e) => {
                  setAuthorSearchQuery(e.target.value);
                  handleFilterChange(e);
                }}
                autoComplete="off"
              />
            </div>
            {authorSuggestions.length > 0 && (
              <FilterSuggestionBox
                suggestions={authorSuggestions}
                setSuggestions={setAuthorSuggestions}
                setSelectedSuggestions={setSelectedAuthors}
                setSearchQuery={setAuthorSearchQuery}
                activeSuggestionIndex={activeAuthorSuggestionIndex}
                elementRef={authorSearchBoxRef}
                inputRef={authorInputRef}
                type="author"
              />
            )}
          </div>
          <p>
            Include{" "}
            <button
              className={includeAllAuthors ? "clicked" : ""}
              onClick={() => setIncludeAllAuthors(true)}
            >
              all
            </button>{" "}
            /{" "}
            <button
              className={!includeAllAuthors ? "clicked" : ""}
              onClick={() => setIncludeAllAuthors(false)}
            >
              either
            </button>
          </p>
        </div>
        <div className="filter-field">
          <div className="filter-type">
            <label htmlFor="availability">Availability </label>
            <input type="checkbox" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchBox;
