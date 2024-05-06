import React, { useContext, useEffect, useState } from "react";
import Axios from "axios";
import DispatchContext from "../../DispatchContext";
import StateContext from "../../StateContext";

function HeaderLoggedOut() {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  const [userId, setUsername] = useState();
  const [password, setPassword] = useState();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // need to add this to get cookies
      Axios.defaults.withCredentials = true;
      const response = await Axios.post("/login", { userId, password });
      if (response.data) {
        console.log(userId);
        appDispatch({ type: "login" });
        appDispatch({ type: "flashMessages", value: "You have successfully logged in" });
      } else {
        appDispatch({ type: "flashMessages", value: "incorrect username/password" });
      }
    } catch (e) {
      appDispatch({ type: "flashMessages", value: "incorrect username/password" });
      console.log("There was a problem.", e);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={e => setUsername(e.target.value)} name="userId" className="form-control form-control-sm input-dark" type="text" placeholder="Username" autoComplete="off" />
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={e => setPassword(e.target.value)} name="password" className="form-control form-control-sm input-dark" type="password" placeholder="Password" />
        </div>
        <div className="col-md-auto">
          <button className="btn btn-success btn-sm">Sign In</button>
        </div>
      </div>
    </form>
  );
}

export default HeaderLoggedOut;
