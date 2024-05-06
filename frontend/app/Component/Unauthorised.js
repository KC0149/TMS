import React, { useEffect } from "react";
import Page from "./Page";
import { Link } from "react-router-dom";

function Unauthorised() {
  return (
    <Page title="....">
      <div className="text-center">
        <h2>You are Unauthorised to view this page.</h2>
        <p className="lead text-muted">
          you can always visit the <Link to="/">homepage</Link> to log in{" "}
        </p>
      </div>
    </Page>
  );
}

export default Unauthorised;
