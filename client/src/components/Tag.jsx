import React from "react";

function Tag({ tagName, removeSelected }) {
  return (
    <span className="tag" onClick={() => removeSelected(tagName)}>
      {tagName} &times;
    </span>
  );
}

export default Tag;
