import React from "react";
import { GoChevronDown } from "react-icons/go";

function FilterButton({ showFilterBox, setShowFilterBox }) {
  return (
    <div
      className="filter-button"
      onClick={() => setShowFilterBox(!showFilterBox)}
    >
      Filter{" "}
      <GoChevronDown
        className={`filter-dropdown-icon ${showFilterBox ? "active" : ""}`}
      />
    </div>
  );
}

export default FilterButton;
