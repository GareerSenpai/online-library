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

  const genreSearchBox = useRef(null);
  const authorSearchBox = useRef(null);

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
      setGenreSuggestions(res?.data.data.genres);
    } else if (type === "author") {
      setAuthorSuggestions(res?.data.data.authors);
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
            <div className="input-box" ref={genreSearchBox}>
              {selectedGenres.map((genre) => (
                <Tag
                  key={genre}
                  tagName={genre}
                  removeSelected={(data) =>
                    setSelectedGenres((prev) =>
                      prev.filter((genre) => genre !== data)
                    )
                  }
                />
              ))}
              <input
                name="genre"
                type="text"
                value={genreSearchQuery}
                onChange={(e) => {
                  setGenreSearchQuery(e.target.value);
                  handleFilterChange(e);
                }}
                autoComplete="off"
              />
            </div>
            <FilterSuggestionBox
              suggestions={genreSuggestions.filter(
                (suggestion) => !selectedGenres.includes(suggestion)
              )}
              setSuggestions={setGenreSuggestions}
              setSelectedSuggestions={setSelectedGenres}
              setSearchQuery={setGenreSearchQuery}
              elementRef={genreSearchBox}
            />
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
            <div className="input-box" ref={authorSearchBox}>
              {selectedAuthors.map((author) => (
                <Tag
                  key={author}
                  tagName={author}
                  removeSelected={(data) =>
                    setSelectedAuthors((prev) =>
                      prev.filter((author) => author !== data)
                    )
                  }
                />
              ))}
              <input
                name="author"
                type="text"
                value={authorSearchQuery}
                onChange={(e) => {
                  setAuthorSearchQuery(e.target.value);
                  handleFilterChange(e);
                }}
                autoComplete="off"
              />
            </div>
            <FilterSuggestionBox
              suggestions={authorSuggestions.filter(
                (suggestion) => !selectedAuthors.includes(suggestion)
              )}
              setSuggestions={setAuthorSuggestions}
              setSelectedSuggestions={setSelectedAuthors}
              setSearchQuery={setAuthorSearchQuery}
              elementRef={authorSearchBox}
            />
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
