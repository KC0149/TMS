import React, { useContext, useEffect } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import DispatchContext from "../../DispatchContext"
import Axios from "axios"
import StateContext from "../../StateContext"

function HeaderLoggedIn() {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  async function handleLogout() {
    try {
      Axios.defaults.withCredentials = true
      const response = await Axios.post("/logouttms")
      if (response.data) {
        appDispatch({ type: "logout" })
        appDispatch({
          type: "flashMessages",
          value: "You have successfully logged out"
        })
      }
    } catch (e) {
      console.log("There was a problem.", e)
    }
  }

  //-----------------check if Active----
  async function handleProfile() {
    try {
      // need to add this to get cookies
      Axios.defaults.withCredentials = true
      const response = await Axios.post("/checkActive")
    } catch (e) {
      appDispatch({ type: "logout" })
      appDispatch({
        type: "flashMessagesError",
        value: "Your session has expired.Please log in again"
      })
      navigate("/")
      console.log("There was a problem or the request was cancelled.", e)
    }
  }
  //------ check if is admin when logged in-------
  useEffect(() => {
    async function isAdmin() {
      try {
        // need to add this to get cookies
        Axios.defaults.withCredentials = true
        const response = await Axios.post("/checkGroup")
        console.log(state.isAdmin)
        if (response.data) {
          appDispatch({ type: "isAdmin" })
        }
      } catch (e) {
        appDispatch({ type: "isNotAdmin" })
      }
    }
    isAdmin()
  }, [])

  //------------------------------------------------

  return (
    <div className="flex-row my-4 my-md-0">
      {/*-------------------for admin---------------*/}

      {/* {appState.isAdmin === true ? (
        <Link to="/user-management">
          <button className="btn btn-sm btn-primary mr-5">User Management</button>
        </Link>
      ) : (
        ""
      )} */}

      {/* -------------------for project lead---------------
      <Link to="/create-app">
        <button onClick={handleProfile} className="btn btn-sm btn-warning mr-5" to="/profile">
          create app
        </button>
      </Link>
      <Link to="/create-task">
        <button onClick={handleProfile} className="btn btn-sm btn-warning mr-5" to="/profile">
          create task
        </button>
      </Link> */}

      {/*----------------------for project manager --------------------------*/}

      {/* <Link to="/create-plan">
        <button onClick={handleProfile} className="btn btn-sm btn-warning mr-5" to="/profile">
          create plan
        </button>
      </Link> */}

      {/*--------------------------------- --------------------------*/}

      {/* <Link to="/profile">
        <button onClick={handleProfile} className="btn btn-sm btn-primary mr-5" to="/profile">
          Update profile
        </button>
      </Link>
      <Link to="/">
        <button onClick={handleLogout} className="btn btn-sm btn-danger">
          Sign Out
        </button>
      </Link> */}
      <ul class="nav nav-pills">
        <li class="nav-item">
          <Link to="/" className={`nav-link ${pathname === "/" ? "active rounded-pill" : "text-white"} `} aria-current="page">
            Home
          </Link>
        </li>
        {appState.isAdmin === true ? (
          <li class="nav-item">
            <Link to="/user-management" className={`nav-link ${pathname === "/user-management" ? "active rounded-pill" : "text-white"} `}>
              User Management
            </Link>
          </li>
        ) : (
          ""
        )}

        <li class="nav-item">
          <Link to="/profile" onClick={handleProfile} className={`nav-link ${pathname === "/profile" ? "active rounded-pill" : "text-white"} `}>
            Update profile
          </Link>
        </li>
        <li class="nav-item">
          <Link to="/" onClick={handleLogout} className={`nav-link  text-white `}>
            Sign Out
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default HeaderLoggedIn
