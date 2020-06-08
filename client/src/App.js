import React from "react";
import { Snake, Home, NotFound } from "./pages";
import { BrowserRouter, Route, Switch } from "react-router-dom";

export default () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/snake" exact component={Snake} />
        <Route path="/" component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
};
