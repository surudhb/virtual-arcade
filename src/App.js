import React from "react";
import { Snake } from "./components";
import { BrowserRouter, Route } from "react-router-dom";

export default () => {
  return (
    <BrowserRouter>
      <div
        style={{ height: "100vh" }}
        className="bg-dark text-light text-center container-fluid"
      >
        <h1>Welcome to the arcade</h1>
        <Route path="/snake" component={Snake} />
      </div>
    </BrowserRouter>
  );
};
