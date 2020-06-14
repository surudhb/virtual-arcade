import React from "react";
import { Snake, Snake2, Home } from "./pages";
import { BrowserRouter, Route } from "react-router-dom";

export default (props) => {
  return (
    <BrowserRouter>
      <Route path="/" exact component={Home} />
      <Route path="/snake" component={Snake} />
      <Route path="/snake2" component={Snake2} />
    </BrowserRouter>
  );
};
