import React, { useContext, useEffect, useState } from "react";
import Page from "./Page";

import Axios from "axios";
import DispatchContext from "../../DispatchContext";

function Landing() {
  const appDispatch = useContext(DispatchContext);

  const [userId, setUsername] = useState();
  const [password, setPassword] = useState();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // need to add this to get cookies
      Axios.defaults.withCredentials = true;
      const response = await Axios.post("/login", { userId, password });

      if (response.data) {
        appDispatch({ type: "login" });
        appDispatch({ type: "flashMessages", value: "You have successfully logged in" });
      }
    } catch (e) {
      if (e.response) {
        if (e.response.status === 400) {
          appDispatch({ type: "flashMessagesError", value: "Please enter userId & password" });
        } else if (e.response.status === 405) {
          appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" });
        } else {
          appDispatch({ type: "flashMessagesError", value: "Incorrect username/password" });
        }
      }

      console.log("There was a problem.", e);
    }
  }

  return (
    <Page title={"Task Manager"}>
      <div className="log-in">
        <h2 className="text-center">Log in to use Task Management System </h2>
        <p className="lead text-muted text-center"></p>
        <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0 log-in-form">
          <div className=" align-items-center">
            <div className="col-md mr-0 pr-md-0 mb-5 mb-md-0">
              <input onChange={e => setUsername(e.target.value)} name="userId" className="form-control form-control-sm input-dark" type="text" placeholder="Username" autoComplete="off" />
            </div>
            <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0 mt-3">
              <input onChange={e => setPassword(e.target.value)} name="password" className="form-control form-control-sm input-dark" type="password" placeholder="Password" />
            </div>
            <div className="col-md-auto mt-3 ml-5">
              <button className="btn btn-success btn-sm">Sign In</button>
            </div>
          </div>
        </form>
      </div>
    </Page>
  );
}

export default Landing;
