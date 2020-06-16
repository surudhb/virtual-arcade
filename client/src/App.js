import React from "react";
import { Snake2, Home } from "./pages";
import { BrowserRouter, Route } from "react-router-dom";

export default (props) => {
  return (
    <BrowserRouter>
      <Route path="/" exact component={Home} />
      <Route path="/snake2" component={Snake2} />
    </BrowserRouter>
  );
};
