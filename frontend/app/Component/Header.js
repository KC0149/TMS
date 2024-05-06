import React, { useContext, useEffect, useState } from "react"
import HeaderLoggedIn from "./HeaderLoggedIn"
import { Link } from "react-router-dom"
import StateContext from "../../StateContext"

function Header() {
  const appState = useContext(StateContext)

  return (
    <header className="header-bar bg-dark mb-2">
      <div className="container d-flex flex-column flex-md-row align-items-center p-3">
        <h4 className="my-0 mr-md-auto font-weight-normal">
          <Link to="/" className="text-white">
            Task Management System
          </Link>
        </h4>
        {appState.loggedIn ? <HeaderLoggedIn /> : ""}
      </div>
    </header>
  )
}

export default Header
