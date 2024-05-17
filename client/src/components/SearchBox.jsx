import React, { useState } from "react";
import FilterButton from "./FilterButton.jsx";
import { IoSearch } from "react-icons/io5";
import debounce from "lodash.debounce";
import axios from "axios";
import { fetchGenreURL, fetchAuthorURL } from "../backend_api_urls.js";

function SearchBox() {
  const [includeAllGenres, setIncludeAllGenres] = useState(false);
  const [includeAllAuthors, setIncludeAllAuthors] = useState(false);
  const [showFilterBox, setShowFilterBox] = useState(false);

  const fetchFilterSuggestions = async (query, type) => {
    let url = "";
    if (type === "genre") {
      url = fetchGenreURL;
    } else if (type === "author") {
      url = fetchAuthorURL;
    }

    const res = await axios.get(url, { params: { [type]: query } });
    console.log(res);
  };

  const handleFilterChange = debounce((e) => {
    const query = e.target.value;
    const type = e.target.name;
    if (!query) return;

    fetchFilterSuggestions(query, type);
  }, 500);

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
            <input name="genre" type="text" onChange={handleFilterChange} />
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
            <input name="author" type="text" onChange={handleFilterChange} />
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
