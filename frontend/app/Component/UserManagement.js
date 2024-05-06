import React, { useContext, useEffect, useState } from "react"
import Page from "./Page"
import { Link, useNavigate } from "react-router-dom"
import Axios from "axios"
import DispatchContext from "../../DispatchContext"
import { useImmerReducer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import StateContext from "../../StateContext"
import CreatableSelect from "react-select/creatable"
import LoadingDotsIcon from "./LoadingDotsIcon"

function UserManagement() {
  const appDispatch = useContext(DispatchContext)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState([])
  const appState = useContext(StateContext)
  const navigate = useNavigate()
  //------ check if is admin when logged in-------
  useEffect(() => {
    async function isAdmin() {
      try {
        // need to add this to get cookies
        Axios.defaults.withCredentials = true
        const response = await Axios.post("/checkGroup")
        if (response.data) {
          appDispatch({ type: "isAdmin" })
          setIsLoading(false)
        }
      } catch (e) {
        appDispatch({ type: "isNotAdmin" })
        appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
        navigate("/")
      }
    }
    isAdmin()
  }, [])

  //---------------for forms-------------------------
  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      // isUnique: false,
      checkCount: 0
    },
    email: {
      value: null,
      hasErrors: false,
      message: "",
      // isUnique: false,
      checkCount: 0,
      optional: true
    },
    password: {
      value: "",
      hasErrors: false,
      message: ""
    },
    isActive: {
      value: "active"
    },
    group: {
      value: []
    },
    submitCount: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "usernameImmediately":
        draft.username.hasErrors = false
        draft.username.value = action.value.toLowerCase()
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true
          draft.username.message = "UserId cannot exceed 30 characters."
        }
        //check for !@#$% in username
        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true
          draft.username.message = "UserId can only contain letters and numbers."
        }
        return
      case "usernameAfterDelay":
        if (draft.username.value.length < 1) {
          draft.username.hasErrors = true
          draft.username.message = "UserId must be at least 1 characters."
        }
        // if no error check if unique using Axios
        if (!draft.username.hasErrors && !action.noRequest) {
          draft.username.checkCount++
        }
        return
      // case "usernameUniqueResults":
      //   if (action.value) {
      //     draft.username.hasErrors = true;
      //     draft.username.isUnique = false;
      //     draft.username.message = "That UserId is already taken.";
      //   } else {
      //     draft.username.isUnique = true;
      //   }
      //   return;
      case "emailImmediately":
        if (action.value == null || document.getElementById("email-register").value == "") {
          draft.email.optional = true
          draft.email.value = null
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
      //   return;
      case "passwordImmediately":
        draft.password.hasErrors = false

        draft.password.value = action.value

        if (draft.password.value.length > 10) {
          draft.password.hasErrors = true
          draft.password.message = "Password cannot exceed 10 characters."
        }
        return
      case "passwordAfterDelay":
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
        return
      case "activeImmediately":
        draft.isActive.value = action.value
        return
      case "groupImmediately":
        if (action.value) {
          draft.group.value = action.value
        }
        return
      case "submitForm":
        if (!draft.username.hasErrors && !draft.email.hasErrors && !draft.password.hasErrors) {
          draft.submitCount++
        }
        if (!draft.username.hasErrors && draft.email.optional && !draft.password.hasErrors) {
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
      case "RESET":
        return initialState
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => dispatch({ type: "usernameAfterDelay" }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.username.value])

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => dispatch({ type: "emailAfterDelay" }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.email.value])

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => dispatch({ type: "passwordAfterDelay" }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.password.value])
  // ---- to check username unique-----
  // useEffect(() => {
  //   if (state.username.checkCount) {
  //     async function checkUser() {
  //       try {
  //         const response = await Axios.post("/doesUseridExist", { userId: state.username.value });
  //         console.log(response.data);
  //         dispatch({ type: "usernameUniqueResults", value: response.data });
  //       } catch (e) {
  //         console.log("There was a problem or the request was cancelled.", e);
  //       }
  //     }
  //     checkUser();
  //   }
  // }, [state.username.checkCount]);
  // // ---- to check email -----
  // useEffect(() => {
  //   if (state.email.checkCount) {
  //     async function checkEmail() {
  //       try {
  //         const response = await Axios.post("/doesEmailExist", { email: state.email.value });
  //         dispatch({ type: "emailUniqueResults", value: response.data });
  //       } catch (e) {
  //         console.log("There was a problem or the request was cancelled.", e);
  //       }
  //     }
  //     checkEmail();
  //   }
  // }, [state.email.checkCount]);

  // ---- to register user -----
  useEffect(() => {
    if (state.submitCount) {
      async function registerUser() {
        try {
          console.log("0000", state.username.value, state.password.value, state.email.value, state.group.value.toString(), state.isActive.value)
          // need to add this to get cookies
          Axios.defaults.withCredentials = true
          const response = await Axios.post("/register", {
            userId: state.username.value,
            password: state.password.value,
            email: state.email.value,
            group: state.group.value.toString(),
            isActive: state.isActive.value
          })

          if (response.data) {
            document.getElementById("form").reset()
            dispatch({ type: "RESET" })
            setValue([])
            //update appstate.newuser created to call fetchUsers
            appDispatch({ type: "newUser", value: response.value })
            appDispatch({ type: "flashMessages", value: "Congrats! You have created a new account." })
          }
        } catch (e) {
          if (e.response) {
            if (e.response.status === 400) {
              appDispatch({ type: "flashMessagesError", value: "Error! Please enter userId & password" })
            }
            if (e.response.status === 401) {
              appDispatch({ type: "flashMessagesError", value: "Error! userId has been registered" })
            } else if (e.response.status === 402) {
              appDispatch({ type: "flashMessagesError", value: "Error! email has been registered" })
            } else if (e.response.status === 408) {
              appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
              appDispatch({ type: "isNotAdmin" })
            } else {
              appDispatch({
                type: "flashMessagesError",
                value: "There was an error creating user. Check inputs"
              })
            }
            console.log("There was a problem or the request was cancelled.", e)
          }
        }
      }
      registerUser()
    }
  }, [state.submitCount])

  function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "groupImmediately", value: selectedValues }) //add tags to group before submit
    dispatch({ type: "usernameImmediately", value: state.username.value })
    dispatch({ type: "usernameAfterDelay", value: state.username.value, noRequest: true })
    if (!state.email.optional) {
      dispatch({ type: "emailImmediately", value: state.email.value })
      dispatch({ type: "emailAfterDelay", value: state.email.value, noRequest: true })
    }
    dispatch({ type: "passwordImmediately", value: state.password.value })
    dispatch({ type: "passwordAfterDelay", value: state.password.value })
    dispatch({ type: "submitForm" })
  }

  //----------------get request for all users from api-------------------
  useEffect(() => {
    async function fetchUsers() {
      try {
        Axios.defaults.withCredentials = true
        const response = await Axios.post("/viewUsers")

        setUser(response.data.data)
      } catch (e) {
        console.log("There was a problem or the request was cancelled.", e.response.data)
      }
    }
    fetchUsers()
  }, [appState.newUser, appState.editedUser])

  //-------------------------------to edit users info---------------------------------
  async function handleEdit(e, userid, group) {
    e.preventDefault()
    try {
      Axios.defaults.withCredentials = true
      const response = await Axios.post("/checkGroup", {})

      if (response.data) {
        appDispatch({ type: "isAdmin" })
        appDispatch({ type: "openEdit", value: userid })

        const groupValues = group.split(",")
        if (groupValues != "") {
          appDispatch({ type: "addTags", value: groupValues })
        }
      }
    } catch (e) {
      appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
      appDispatch({ type: "isNotAdmin" })
    }
  }

  //---------------for group-------------------------

  const [option, setOption] = useState([])
  const [value, setValue] = useState([])

  const createOption = label => ({
    label: label.replace(/[, ]+/g, ""), // Remove spaces and commas
    value: label.toLowerCase().replace(/\W/g, "") //Removes all non-word characters (letter, digit, or underscore)
  })

  //to view all groups in drop down
  useEffect(() => {
    async function fetchGroups() {
      try {
        Axios.defaults.withCredentials = true
        const response = await Axios.post("/viewGroups")
        //console.log(response)

        const grouplist = response.data.data
        console.log(grouplist)
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

  //create group function
  const handleCreateOption = async inputValue => {
    const newOption = createOption(inputValue)

    try {
      const response = await Axios.post("/createGroup", { group: inputValue })

      if (response.data) {
        //add value to select options
        setOption(prev => [...prev, newOption])

        //add value to previous values (set to array of values)
        setValue(prevValue => [...prevValue, newOption])
      }
    } catch (e) {
      if (e.response.status === 408) {
        appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
        appDispatch({ type: "isNotAdmin" })
      }
      console.log("There was a problem or the request was cancelled.", e)
    }
  }

  //map from array of values
  const selectedValues = value.map(option => option.value)

  const Styles = {
    control: provided => ({
      ...provided,
      width: "200px"
    }),
    menu: (provided, state) => ({
      ...provided,
      zIndex: 9999
    })
  }

  //--------------------------------------------------
  if (isLoading)
    return (
      <Page title="....">
        <LoadingDotsIcon />
      </Page>
    )

  if (!isLoading) {
    return (
      <>
        <Page wide={true} title={"Users Management"}>
          <Link className="large font-weight-bold pb" to={"/"}>
            &laquo;Back
          </Link>
          <div className="container">
            <div className="user-management">
              <form id="form" onSubmit={handleSubmit}>
                <table className="user-table">
                  <thead>
                    <tr>
                      <th> UserId</th>
                      <th> Password</th>
                      <th> Email</th>
                      <th> isActive</th>
                      <th> Group</th>
                    </tr>
                  </thead>
                  {/* form inputs  */}
                  <tbody>
                    <tr>
                      <td>
                        <input
                          onChange={e => dispatch({ type: "usernameImmediately", value: e.target.value })}
                          id="username-register"
                          name="username"
                          className="form-control input-box"
                          type="text"
                          placeholder="Pick a userId"
                          autoComplete="off"
                        />
                        <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage-createUser" unmountOnExit>
                          <div className="alert alert-danger small liveValidateMessage-createUser">{state.username.message}</div>
                        </CSSTransition>
                      </td>
                      <td>
                        <input
                          onChange={e => dispatch({ type: "passwordImmediately", value: e.target.value })}
                          id="password-register"
                          name="password"
                          className="form-control input-box"
                          type="password"
                          placeholder="Create a password"
                        />
                        <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage-createUser" unmountOnExit>
                          <div className="alert alert-danger small liveValidateMessage-createUser">{state.password.message}</div>
                        </CSSTransition>
                      </td>
                      <td>
                        <input
                          onChange={e => dispatch({ type: "emailImmediately", value: e.target.value })}
                          id="email-register"
                          name="email"
                          className="form-control input-box"
                          type="text"
                          placeholder="you@example.com"
                          autoComplete="off"
                        />
                        <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage-createUser" unmountOnExit>
                          <div className="alert alert-danger small liveValidateMessage-createUser">{state.email.message}</div>
                        </CSSTransition>
                      </td>
                      <td>
                        <select
                          id="isActive-register"
                          className="isActive-register"
                          name="isActive"
                          onChange={e => dispatch({ type: "activeImmediately", value: e.target.value })}
                        >
                          <option value="active">Active</option>
                          <option value="not active">Not Active</option>
                        </select>
                      </td>

                      <td>
                        <div>
                          <CreatableSelect
                            styles={Styles}
                            isClearable
                            isMulti
                            options={option}
                            onCreateOption={handleCreateOption}
                            value={value}
                            onChange={newValue => setValue(newValue)}
                          />
                        </div>
                      </td>
                      <td>
                        <button type="submit" className="py-2 mt-2 btn btn-sm btn-success btn-block">
                          Create User
                        </button>
                      </td>
                      {/* show all users  */}
                    </tr>
                    {user.map(user => (
                      <tr key={user.userId}>
                        <td>{user.userId} </td>
                        <td> ******</td>
                        <td>{user.email}</td>
                        <td>{user.isActive}</td>
                        <td>{user.group}</td>
                        <td>
                          <button onClick={e => handleEdit(e, user.userId, user.group)} className="py-2 mt-2 btn btn-sm btn-secondary btn-block">
                            Edit User
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </form>
            </div>
          </div>
        </Page>
      </>
    )
  }
}

export default UserManagement
