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
import Select from "react-select"
import dayjs from "dayjs"
import { DatePicker } from "@mui/x-date-pickers"

function CreateApp() {
  const navigate = useNavigate()
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  const initialState = {
    App_Acronym: {
      value: null,
    },
    App_Description: {
      value: "",
    },
    App_Rnumber: {
      value: null,
    },
    App_startDate: {
      value: null,
    },
    App_endDate: {
      value: null,
    },
    App_permit_Open: {
      value: [],
    },
    App_permit_toDoList: {
      value: [],
    },
    App_permit_Doing: {
      value: [],
    },
    App_permit_Done: {
      value: [],
    },
    App_permit_Create: {
      value: [],
    },
    submitCount: 0,
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "App_AcronymImmediately":
        draft.App_Acronym.value = action.value
        return
      case "App_DescriptionImmediately":
        draft.App_Description.value = action.value
        return
      case "App_Rnumber":
        draft.App_Rnumber.value = action.value
        return
      case "App_startDate":
        draft.App_startDate.value = action.value
        return
      case "App_endDate":
        draft.App_endDate.value = action.value
        return
      case "App_permit_Open":
        draft.App_permit_Open.value = action.value
        return
      case "App_permit_toDoList":
        draft.App_permit_toDoList.value = action.value
        return
      case "App_permit_Doing":
        draft.App_permit_Doing.value = action.value
        return
      case "App_permit_Done":
        draft.App_permit_Done.value = action.value
        return
      case "App_permit_Create":
        draft.App_permit_Create.value = action.value
        return

      case "submitForm":
        draft.submitCount++
        return
      case "RESET":
        return initialState
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  async function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "App_permit_Open", value: selectedApp_permit_Open })
    dispatch({
      type: "App_permit_toDoList",
      value: selectedApp_permit_toDoList,
    })
    dispatch({ type: "App_permit_Doing", value: selectedApp_permit_Doing })
    dispatch({ type: "App_permit_Done", value: selectedApp_permit_Done })
    dispatch({ type: "App_permit_Create", value: selectedApp_permit_Create })

    dispatch({ type: "submitForm" })
  }

  useEffect(() => {
    if (state.submitCount) {
      async function createApp() {
        try {
          const response = await Axios.post("/create-app", {
            App_Acronym: state.App_Acronym.value,
            App_Description: state.App_Description.value,
            App_Rnumber: state.App_Rnumber.value,
            App_startDate: state.App_startDate.value,
            App_endDate: state.App_endDate.value,
            App_permit_Open: state.App_permit_Open.value.toString(),
            App_permit_toDoList: state.App_permit_toDoList.value.toString(),
            App_permit_Doing: state.App_permit_Doing.value.toString(),
            App_permit_Done: state.App_permit_Done.value.toString(),
            App_permit_Create: state.App_permit_Create.value.toString(),
          }) // no need :""  if same as the title
          //redirect to new post url
          appDispatch({
            type: "flashMessages",
            value: "CONGRATS! YOU CREATED AN App",
          })
          navigate(`/`)
        } catch (e) {
          if (e.response.status === 406) {
            appDispatch({
              type: "flashMessagesError",
              value: "Error! Please enter App Acronym or Rnumber ",
            })
          } else if (e.response.status === 401) {
            appDispatch({
              type: "flashMessagesError",
              value: "Error! App Acronym has been registered",
            })
          } else if (e.response.status === 400) {
            appDispatch({
              type: "flashMessagesError",
              value: "You do not have the authorise rights",
            })
            navigate(`/`)
          } else {
            appDispatch({
              type: "flashMessagesError",
              value: "There was an error creating app. Check inputs",
            })
          }
          console.log("there was a problem")
        }
      }
      createApp()
    }
  }, [state.submitCount])
  //---------------for app_permit -------------------------

  const [option, setOption] = useState([])
  const [App_permit_Open, setApp_permit_Open] = useState([])
  const [App_permit_toDoList, setApp_permit_toDoList] = useState([])
  const [App_permit_Doing, setApp_permit_Doing] = useState([])
  const [App_permit_Done, setApp_permit_Done] = useState([])
  const [App_permit_Create, setApp_permit_Create] = useState([])

  //to view all groups in drop down
  useEffect(() => {
    async function fetchGroups() {
      try {
        Axios.defaults.withCredentials = true
        const response = await Axios.post("/viewGroups")

        const grouplist = response.data.data
        const options = grouplist.map((item) => ({
          label: item,
          value: item,
        }))

        setOption(options)
      } catch (e) {
        console.log("There was a problem or the request was cancelled.", e.response.data)
      }
    }
    fetchGroups()
  }, [])

  //map from array of values
  const selectedApp_permit_Open = App_permit_Open.map((option) => option.value)
  const selectedApp_permit_toDoList = App_permit_toDoList.map((option) => option.value)
  const selectedApp_permit_Doing = App_permit_Doing.map((option) => option.value)
  const selectedApp_permit_Done = App_permit_Done.map((option) => option.value)
  const selectedApp_permit_Create = App_permit_Create.map((option) => option.value)

  const Styles = {
    control: (provided) => ({
      ...provided,
      width: "200px",
    }),
    menu: (provided, state) => ({
      ...provided,
      zIndex: 9999,
    }),
  }

  const handleKeyDown = (e) => {
    const key = e.key

    // Allow Backspace, ArrowLeft, ArrowRight, and Delete keys
    if (key === "Backspace" || key === "ArrowLeft" || key === "ArrowRight" || key === "Delete") {
      return
    }

    // Prevent input of . and -
    if (key === "." || key === "-") {
      e.preventDefault()
    }
  }

  return (
    <Page title="Create new app">
      <Link className="large font-weight-bold pb" to={`/`}>
        &laquo;Back
      </Link>
      <div className="card" style={{ width: "80%", margin: "auto" }}>
        <div className="container py-2 my-3">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="col-md-6 mb-3">
                <label htmlFor="post-title" className="text-muted mb-1">
                  <small>App_Acronym</small>
                </label>
                <input
                  onChange={(e) =>
                    dispatch({
                      type: "App_AcronymImmediately",
                      value: e.target.value,
                    })
                  }
                  autoFocus
                  name="title"
                  id="post-title"
                  className="form-control form-control "
                  type="text"
                  placeholder="Enter a App Acronym"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="col-sm-3 mb-3">
                <label htmlFor="post-title" className="text-muted mb-1">
                  <small>App_Rnumber</small>
                </label>
                <input
                  onChange={(e) => dispatch({ type: "App_Rnumber", value: e.target.value })}
                  autoFocus
                  name="title"
                  id="post-title"
                  className="form-control form-control "
                  pattern="[0-9]*" // Only allows digits (0-9)
                  inputMode="numeric" // Specifies the numeric input mode
                  placeholder="Enter only integers"
                  type="number"
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  required
                  style={{ WebkitAppearance: "none", MozAppearance: "textfield" }} // This CSS rule hides the arrows
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="post-body" className="text-muted mb-1 d-block">
                <small>App_Description</small>
              </label>
              <textarea
                onChange={(e) =>
                  dispatch({
                    type: "App_DescriptionImmediately",
                    value: e.target.value,
                  })
                }
                name="body"
                id="post-body"
                className="body-content textarea form-control fs-5"
                type="text"
                placeholder="Enter a Description "
              ></textarea>
            </div>

            <div className="form-row ">
              <div className="col col-md-4">
                <label htmlFor="post-title" className="text-muted mb-1"></label>
                <DatePicker
                  views={["year", "month", "day"]}
                  onChange={(newValue) =>
                    dispatch({
                      type: "App_startDate",
                      value: dayjs(newValue.$d).format("YYYY-MM-DD HH:mm:ss"),
                    })
                  }
                  label="App_startDate"
                />{" "}
              </div>
              <div className="col col-md-4 ">
                <label htmlFor="post-title" className="text-muted mb-1"></label>
                <DatePicker
                  views={["year", "month", "day"]}
                  onChange={(newValue) =>
                    dispatch({
                      type: "App_endDate",
                      value: dayjs(newValue.$d).format("YYYY-MM-DD HH:mm:ss"),
                    })
                  }
                  label="App_endDate"
                />
              </div>
              <div className="form-group col-md-2">
                <label htmlFor="post-title" className="text-muted mb-1">
                  <small>App_permit_Create</small>
                </label>
                <Select
                  styles={Styles}
                  isClearable
                  required
                  isMulti
                  options={option}
                  value={App_permit_Create}
                  onChange={(newValue) => {
                    newValue === "" ? App_permit_Create(null) : setApp_permit_Create(newValue)
                  }}
                />{" "}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-3">
                <label htmlFor="post-title" className="text-muted mb-1">
                  <small>App_permit_Open</small>
                </label>
                <Select
                  styles={Styles}
                  isClearable
                  isMulti
                  options={option}
                  value={App_permit_Open}
                  required
                  onChange={(newValue) => {
                    newValue === "" ? setApp_permit_Open(null) : setApp_permit_Open(newValue)
                  }}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="post-title" className="text-muted mb-1">
                  <small>App_permit_toDoList</small>
                </label>
                <Select
                  styles={Styles}
                  isClearable
                  isMulti
                  options={option}
                  value={App_permit_toDoList}
                  required
                  onChange={(newValue) => {
                    newValue === "" ? setApp_permit_toDoList(null) : setApp_permit_toDoList(newValue)
                  }}
                />
              </div>

              <div className="form-group col-md-3">
                <label htmlFor="post-title" className="text-muted mb-1">
                  <small>App_permit_Doing</small>
                </label>
                <Select
                  styles={Styles}
                  isClearable
                  isMulti
                  options={option}
                  value={App_permit_Doing}
                  required
                  onChange={(newValue) => {
                    newValue === "" ? setApp_permit_Doing(null) : setApp_permit_Doing(newValue)
                  }}
                />{" "}
              </div>

              <div className="form-group col-md-2">
                <label htmlFor="post-title" className="text-muted mb-1">
                  <small>App_permit_Done</small>
                </label>
                <Select
                  styles={Styles}
                  isClearable
                  isMulti
                  options={option}
                  value={App_permit_Done}
                  required
                  onChange={(newValue) => {
                    newValue === "" ? setApp_permit_Done(null) : setApp_permit_Done(newValue)
                  }}
                />{" "}
              </div>
            </div>
            <button className="btn btn-primary">Create app</button>
          </form>
        </div>
      </div>
    </Page>
  )
}

export default CreateApp
