import React, { useEffect } from "react";
import Page from "./Page";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <Page title="....">
      <div className="text-center">
        <h2>Whoops, we cannot find that page</h2>
        <p className="lead text-muted">
          you can always visit the <Link to="/">homepage</Link> to log in{" "}
        </p>
      </div>
    </Page>
  );
}

export default NotFound;
