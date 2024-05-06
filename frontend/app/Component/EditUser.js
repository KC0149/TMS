import React, { useEffect, useContext, useState } from "react"
import Page from "./Page"
import { useImmer, useImmerReducer } from "use-immer"
import Axios from "axios"
import { Link } from "react-router-dom"
import DispatchContext from "../../DispatchContext"
import { CSSTransition } from "react-transition-group"
import StateContext from "../../StateContext"
import CreatableSelect from "react-select/creatable"

function EditUser() {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler)
    return () => document.removeEventListener("keyup", searchKeyPressHandler)
  }, [])

  //closing edit with escape key
  function searchKeyPressHandler(e) {
    if (e.keyCode == 27) {
      appDispatch({ type: "closeEdit" })
    }
  }

  const initialState = {
    email: {
      value: null,
      hasErrors: false,
      message: "",

      checkCount: 0,
      optional: true
    },
    password: {
      value: null,
      hasErrors: false,
      message: "",
      optional: true
    },
    isActive: {
      value: "active"
    },
    group: {
      value: appState.group
    },
    submitCount: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "emailImmediately":
        if (action.value == null || action.value == "") {
          draft.email.optional = true
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
        if (!draft.email.hasErrors && !action.noRequest && !draft.email.optional) {
          draft.email.checkCount++
        }
        return

      case "passwordImmediately":
        if (action.value == null || action.value == "") {
          draft.password.optional = true
        }
        if (action.value) {
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
          } else {
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

        // check if email has no errors and unique & password is empty
        if (draft.email.optional && draft.password.optional) {
          draft.submitCount++
        }
        //if has errors give error message
        if (draft.email.hasErrors || draft.password.hasErrors) {
          appDispatch({
            type: "flashMessagesError",
            value: "There was an error creating user. Check inputs"
          })
        }

        return
      case "activeImmediately":
        draft.isActive.value = action.value
        return
      case "groupImmediately":
        draft.group.value = action.value

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

  useEffect(() => {
    if (state.submitCount) {
      async function fetchResults() {
        try {
          console.log("Sending update request...")

          // need to add this to get cookies
          Axios.defaults.withCredentials = true
          const response = await Axios.post("/updateUsers", {
            userId: appState.userId,
            password: state.password.value,
            email: state.email.value,
            group: state.group.value.toString(),
            isActive: state.isActive.value
          })

          appDispatch({ type: "editedUser", value: response.value })
          appDispatch({ type: "flashMessages", value: "Congrats! Your account have been updated." })
          document.getElementById("Updateform").reset()

          appDispatch({ type: "closeEdit" })
          appDispatch({ type: "addTags", value: state.group.value })
          dispatch({ type: "RESET" })
        } catch (e) {
          if (e.response) {
            if (e.response.status === 402) {
              appDispatch({ type: "flashMessagesError", value: "Error! email has been registered" })
            } else {
              appDispatch({ type: "flashMessagesError", value: "There was an error updating user." })

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
    dispatch({ type: "groupImmediately", value: selectedValues })
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

  //---------------for group-------------------------

  //import from appstate of user group and create option
  const userGroupOptions = appState.userGroup.map(group => ({
    label: group,
    value: group
  }))

  const [option, setOption] = useState([])

  //initial state includes current user groups
  const [value, setValue] = useState(userGroupOptions)

  const createOption = label => ({
    label,
    value: label.toLowerCase().replace(/\W/g, "")
  })

  //to view all groups in drop down
  useEffect(() => {
    async function fetchGroups() {
      try {
        Axios.defaults.withCredentials = true
        const response = await Axios.post("/viewGroups")

        const grouplist = response.data.data
        const options = grouplist.map(item => ({
          label: item.group,
          value: item.group
        }))

        setOption(options)
      } catch (e) {
        console.log("There was a problem or the request was cancelled.", e.response.data)
      }
    }
    fetchGroups()
  }, [])

  //when new group are created
  const handleCreateOption = async inputValue => {
    const newOption = createOption(inputValue)

    try {
      const response = await Axios.post("/createGroup", { group: inputValue })

      if (response.data) {
        //add to previous options after created
        setOption(prev => [...prev, newOption])
        //set to value with the updated options
        setValue(prevValue => [...prevValue, newOption])
      }
    } catch (e) {
      console.log("There was a problem or the request was cancelled.", e)
    }
  }

  //only extract the value from the option
  const selectedValues = value.map(option => option.value)

  //--------------------------------------------------------------
  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container">
          <span onClick={() => appDispatch({ type: "closeEdit" })} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="edit-user">
          <div className="align-items-center  ">
            <form id="Updateform" onSubmit={handleSubmit}>
              <div className="form-group col-md-3">
                <label htmlFor="userId-register" className="text-black mb-1">
                  <small>userId</small>
                </label>
                <input value={appState.userId} disabled id="userId" name="userId" className="form-control " type="text" />
              </div>
              <div className="form-group col-md-7">
                <label htmlFor="email-register" className="text-black mb-1">
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
              <div className="form-group col-md-7">
                <label htmlFor="password-register" className="text-black mb-1">
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
              <div className="form-group">
                <label>
                  <small
                    style={{
                      padding: " 15px"
                    }}
                  >
                    Group
                  </small>
                </label>
                <CreatableSelect
                  isClearable
                  isMulti
                  options={option}
                  onCreateOption={handleCreateOption}
                  value={value}
                  onChange={newValue => setValue(newValue)}
                  className="form-group col-6 "
                />
              </div>
              {/* is active */}
              <div className="form-group col-md-2">
                <label>
                  <small> isActive </small>
                  <br />
                  <select id="isActive-register" name="isActive" onChange={e => dispatch({ type: "activeImmediately", value: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="not active">Not Active</option>
                  </select>
                </label>
              </div>

              <button type="submit" className="py-3 mt-4 btn btn-lg btn-success form-group col-6">
                Update
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditUser
