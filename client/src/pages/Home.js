import React from "react";
import { Link } from "react-router-dom";

export default () => {
  return (
    <div
      style={{ height: "100vh" }}
      className="bg-dark text-light text-center container-fluid"
    >
      <div className="jumbotron jumbotron-fluid bg-dark">
        <h1>Welcome to the arcade!</h1>
        <ul className="list-group">
          <li className="list-group-item bg-dark border-secondary">
            <Link to="/snake">Go to Snake</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};
