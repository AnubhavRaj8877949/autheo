"use client";

import "./heading.scss";

const Heading = ({ heading }) => {
  return (
    <div className="headerButton">
      <div className="common_header">
        <h2>{heading}</h2>
      </div>
    </div>
  );
};

export default Heading;
