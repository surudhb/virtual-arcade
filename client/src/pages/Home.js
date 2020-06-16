import React, { useState } from "react";
import { Link } from "react-router-dom";

export default () => {
  const [name, setName] = useState("");

  return (
    <div
      style={{ height: "100vh" }}
      className="bg-dark text-light text-center container-fluid"
    >
      <div className="jumbotron jumbotron-fluid bg-dark">
        <h1>Welcome to the arcade!</h1>
        <ul className="list-group">
          <li className="list-group-item bg-dark border-secondary">
            Play Snake
            <input
              type="text"
              placeholder="name"
              id="name"
              className="form-control my-2 w-50 mx-auto"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Link to={{ pathname: "/snake2", state: { name } }}>
              <button disabled={!name} className="btn btn-dark" type="submit">
                Enter
              </button>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};
