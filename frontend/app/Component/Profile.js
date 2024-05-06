import React, { useContext, useEffect, useReducer, useState } from "react"
import Container from "./Container"
import Page from "./Page"
import Axios from "axios"
import { Link } from "react-router-dom"
import { useImmer, useImmerReducer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import DispatchContext from "../../DispatchContext"

function Profile() {
  const appDispatch = useContext(DispatchContext)

  const initialState = {
    email: {
      value: null,
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
      optional: true
    },
    password: {
      value: null,
      hasErrors: false,
      message: "",
      optional: true
    },
    submitCount: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "emailImmediately":
        if (action.value == null || action.value == "") {
          draft.email.optional = true
          draft.email.value == null
        } else {
          draft.email.hasErrors = false
          draft.email.value = action.value
          draft.email.optional = false
        }
        return
      case "emailAfterDelay":
        //if doenst match basic email pattern
        if (!draft.email.optional) {
          if (!/^\S+@\S+$/.test(draft.email.value)) {
            draft.email.hasErrors = true
            draft.email.message = "You must provide a valid email address."
          }
        }
        if (!draft.email.hasErrors && !action.noRequest) {
          draft.email.checkCount++
        }
        return
        // case "emailUniqueResults":
        //   if (!draft.email.optional) {
        //     if (action.value) {
        //       draft.email.hasErrors = true;
        //       draft.email.isUnique = false;
        //       draft.email.message = "That email is already being used.";
        //     } else {
        //       draft.email.isUnique = true;
        //     }
        //   }

        return
      case "passwordImmediately":
        if (!action.value || action.value == "") {
          draft.password.optional = true
          draft.password.value == null
        } else {
          draft.password.hasErrors = false
          draft.password.value = action.value
          draft.password.optional = false
          if (draft.password.value.length > 10) {
            draft.password.hasErrors = true
            draft.password.message = "Password cannot exceed 10 characters."
          }
        }

        return
      case "passwordAfterDelay":
        if (!draft.password.optional) {
          if (draft.password.value.length < 8) {
            draft.password.hasErrors = true
            draft.password.message = "Password must be at least 8 characters."
          }
          if (!/[a-zA-Z]/.test(draft.password.value)) {
            draft.password.hasErrors = true
            draft.password.message = "Password must contain alphabets."
          }

          if (!/[0-9]/.test(draft.password.value)) {
            draft.password.hasErrors = true
            draft.password.message = "Password must contain numbers."
          }
          if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(draft.password.value)) {
            draft.password.hasErrors = true
            draft.password.message = "Password must contain special character."
          }
        }
        return
      case "submitForm":
        // check if email has no errors and unique & password has no errors and unique
        if (!draft.email.hasErrors && !draft.password.hasErrors) {
          draft.submitCount++
        }
        // check if email is empty & password has no errors and unique

        if (draft.email.optional && !draft.password.optional && !draft.password.hasErrors) {
          draft.submitCount++
        }
        // check if email has no errors and unique & password is empty
        if (!draft.email.optional && draft.password.optional && !draft.email.hasErrors) {
          draft.submitCount++
        }

        // check if email  & password is empty
        if (draft.email.optional && draft.password.optional) {
          draft.submitCount++
        }
        //if has errors give error message
        if (draft.email.hasErrors || draft.password.hasErrors) {
          appDispatch({ type: "flashMessagesError", value: "There was an error creating user. Check inputs" })
        }

        return
      case "RESET":
        return initialState
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.email.value || !state.email.optional) {
      const delay = setTimeout(() => dispatch({ type: "emailAfterDelay" }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.email.value, state.email.optional])

  useEffect(() => {
    if (state.password.value || !state.password.optional) {
      const delay = setTimeout(() => dispatch({ type: "passwordAfterDelay" }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.password.value, state.password.optional])

  // useEffect(() => {
  //   if (state.email.checkCount) {
  //     async function fetchResults() {
  //       try {
  //         const response = await Axios.post("/doesEmailExist", { email: state.email.value });
  //         dispatch({ type: "emailUniqueResults", value: response.data });
  //       } catch (e) {
  //         console.log("There was a problem or the request was cancelled.", e);
  //       }
  //     }
  //     fetchResults();
  //   }
  // }, [state.email.checkCount]);

  useEffect(() => {
    if (state.submitCount) {
      async function fetchResults() {
        try {
          // need to add this to get cookies
          Axios.defaults.withCredentials = true
          const response = await Axios.post("/update-profile", { password: state.password.value, email: state.email.value })

          document.getElementById("form").reset()
          dispatch({ type: "RESET" })
          appDispatch({ type: "flashMessages", value: "Congrats! Your account have been updated." })
        } catch (e) {
          if (e.response) {
            if (e.response.status === 402) {
              appDispatch({ type: "flashMessagesError", value: "Error! email has been registered" })
            } else if (e.response.status === 400) {
              appDispatch({ type: "flashMessagesError", value: "Please enter email / password to update" })
            } else {
              appDispatch({ type: "flashMessagesError", value: "There was an error updating profile." })

              console.log("There was a problem or the request was cancelled.", e)
            }
          }
        }
      }
      fetchResults()
    }
  }, [state.submitCount])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!state.email.optional) {
      dispatch({ type: "emailImmediately", value: state.email.value })
      dispatch({ type: "emailAfterDelay", value: state.email.value, noRequest: true })
    }
    if (!state.password.optional) {
      dispatch({ type: "passwordImmediately", value: state.password.value })
      dispatch({ type: "passwordAfterDelay", value: state.password.value })
    }
    dispatch({ type: "submitForm" })
  }

  return (
    <Page wide={false} title={"Update User"}>
      <Link className="large font-weight-bold pb-2" to={"/"}>
        &laquo;Back
      </Link>
      <div className=" w-100 m-auto col-6 ">
        <div className="col align-items-center justify-content-center">
          <h1 className="display-5 mt-5">Update profile</h1>

          <div className="">
            <form id="form" onSubmit={handleSubmit}>
              <div className="form-group form-floating">
                <label htmlFor="email-register" className="text-muted mb-1">
                  <small>Email</small>
                </label>
                <input
                  onChange={e => dispatch({ type: "emailImmediately", value: e.target.value })}
                  id="email-register"
                  name="email"
                  className="form-control"
                  type="text"
                  placeholder="you@example.com"
                  autoComplete="off"
                />
                <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                  <div className="alert alert-danger small liveValidateMessage">{state.email.message}</div>
                </CSSTransition>
              </div>
              <div className="form-group form-floating">
                <label htmlFor="password-register" className="text-muted mb-1">
                  <small>Password</small>
                </label>
                <input
                  onChange={e => dispatch({ type: "passwordImmediately", value: e.target.value })}
                  id="password-register"
                  name="password"
                  className="form-control"
                  type="password"
                  placeholder="Create a password"
                />
                <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                  <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>
                </CSSTransition>
              </div>
              <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
                Update
              </button>
            </form>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default Profile
