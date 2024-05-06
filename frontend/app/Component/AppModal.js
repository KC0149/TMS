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

function AppModal(props) {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  //-----------fetch all app-----------------
  const { app } = props

  const App_permit_Open_initial = app.App_permit_Open?.split(",") //comes in a string from backend hence need to split them with ,
  const App_permit_toDoList_initial = app.App_permit_toDoList?.split(",")
  const App_permit_Doing_initial = app.App_permit_Doing?.split(",")
  const App_permit_Done_initial = app.App_permit_Done?.split(",")
  const App_permit_Create_initial = app.App_permit_create ? app.App_permit_create.split(",") : null

  const initialState = {
    App_Acronym: {
      value: app.App_Acronym
    },
    App_Description: {
      value: app.App_Description
    },
    App_Rnumber: {
      value: app.App_Rnumber
    },
    App_startDate: {
      initial: dayjs(dayjs(app.App_startDate).format("YYYY-MM-DD")),
      value: app.App_startDate ? dayjs(app.App_startDate).format("YYYY-MM-DD") : null
    },
    App_endDate: {
      initial: dayjs(dayjs(app.App_endDate).format("YYYY-MM-DD")),
      value: app.App_endDate ? dayjs(app.App_endDate).format("YYYY-MM-DD") : null
    },
    App_permit_Open: {
      value: App_permit_Open_initial
    },
    App_permit_toDoList: {
      value: App_permit_toDoList_initial
    },
    App_permit_Doing: {
      value: App_permit_Doing_initial
    },
    App_permit_Done: {
      value: App_permit_Done_initial
    },
    App_permit_Create_: {
      value: App_permit_Create_initial
    },

    submitCount: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "App_AcronymImmediately":
        draft.App_Acronym = action.value
        return
      case "App_DescriptionImmediately":
        draft.App_Description.value = action.value
        return
      case "App_Rnumber":
        draft.App_Rnumber = action.value
        return
      case "App_startDate":
        draft.App_startDate.value = action.value
        return
      case "App_endDate":
        draft.App_endDate.value = action.value

        return
      case "App_permit_Open":
        draft.App_permit_Open = action.value

        return
      case "App_permit_toDoList":
        draft.App_permit_toDoList = action.value
        return
      case "App_permit_Doing":
        draft.App_permit_Doing = action.value
        return
      case "App_permit_Done":
        draft.App_permit_Done = action.value
        return
      case "App_permit_Create":
        draft.App_permit_Create = action.value
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
      value: selectedApp_permit_toDoList
    })
    dispatch({ type: "App_permit_Doing", value: selectedApp_permit_Doing })
    dispatch({ type: "App_permit_Done", value: selectedApp_permit_Done })
    dispatch({ type: "App_permit_Create", value: selectedApp_permit_Create })
    dispatch({ type: "submitForm" })
  }

  useEffect(() => {
    if (state.submitCount) {
      async function updateApp() {
        try {
          const response = await Axios.post("/update-app", {
            App_Acronym: state.App_Acronym.value,
            App_Description: state.App_Description.value,
            App_startDate: state.App_startDate.value,
            App_endDate: state.App_endDate.value,
            App_permit_Open: state.App_permit_Open.toString(),
            App_permit_toDoList: state.App_permit_toDoList.toString(),
            App_permit_Doing: state.App_permit_Doing.toString(),
            App_permit_Done: state.App_permit_Done.toString(),
            App_permit_Create: state.App_permit_Create.toString()
          }) // no need :""  if same as the title
          //redirect to new post url
          appDispatch({
            type: "flashMessages",
            value: "CONGRATS! YOU UPDATED AN App"
          })
          appDispatch({ type: "closeAppModal" }) //close modal
          appDispatch({ type: "appEdited" }) //refresh app page api call
        } catch (e) {
          appDispatch({
            type: "flashMessagesError",
            value: "You do not have the authorise rights"
          })
          appDispatch({ type: "closeAppModal" }) //close modal
          console.log("there was a problem")
        }
      }
      updateApp()
    }
  }, [state.submitCount])

  //---------------for app_permit -------------------------

  const [option, setOption] = useState([])
  const [App_permit_Open, setApp_permit_Open] = useState(
    app.App_permit_Open ? App_permit_Open_initial.map(item => ({ label: item, value: item })) : []
  ) //cannot use state. instead use the props that was passed //need to map as may contain a few backend then has to group them with , back to strings
  const [App_permit_toDoList, setApp_permit_toDoList] = useState(
    app.App_permit_toDoList
      ? App_permit_toDoList_initial.map(item => ({
          label: item,
          value: item
        }))
      : []
  ) //cannot use state. instead use the props that was passed
  const [App_permit_Doing, setApp_permit_Doing] = useState(
    app.App_permit_Doing ? App_permit_Doing_initial.map(item => ({ label: item, value: item })) : []
  ) //cannot use state. instead use the props that was passed
  const [App_permit_Done, setApp_permit_Done] = useState(
    app.App_permit_Done ? App_permit_Done_initial.map(item => ({ label: item, value: item })) : []
  ) //cannot use state. instead use the props that was passed
  const [App_permit_Create, setApp_permit_Create] = useState(
    app.App_permit_create ? App_permit_Create_initial.map(item => ({ label: item, value: item })) : []
  ) //cannot use state. instead use the props that was passed

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

  //map from array of values
  const selectedApp_permit_Open = App_permit_Open.map(option => option.value)
  const selectedApp_permit_toDoList = App_permit_toDoList.map(option => option.value)
  const selectedApp_permit_Doing = App_permit_Doing.map(option => option.value)

  const selectedApp_permit_Done = App_permit_Done.map(option => option.value)
  const selectedApp_permit_Create = App_permit_Create.map(option => option.value)

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
  //----------------------------------------------
  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler)
    return () => document.removeEventListener("keyup", searchKeyPressHandler)
  }, [])

  //closing edit with escape key
  function searchKeyPressHandler(e) {
    if (e.keyCode == 27) {
      appDispatch({ type: "closeAppModal" })
    }
  }

  return (
    <div className="search-overlay">
      <Page title="Edit App">
        <span onClick={e => appDispatch({ type: "closeAppModal" })} className="close-live-search">
          <i className="fas fa-times-circle"></i>
        </span>
        <div className="card mt-3  appModal" style={{ width: "80%", margin: "auto" }}>
          <div className="container py-4">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="post-title" className="text-muted mb-1">
                    <small>App_Acronym</small>
                  </label>
                  <input
                    value={app.App_Acronym}
                    disabled
                    autoFocus
                    name="App_Acronym"
                    id="App_Acronym-title"
                    className="form-control form-control-sm"
                    type="text"
                    placeholder=""
                    autoComplete="off"
                  />
                </div>
                <div className="col-sm-2 mb-3">
                  <label className="text-muted mb-1">
                    <small>App_Rnumber</small>
                  </label>
                  <input
                    value={app.App_Rnumber}
                    disabled
                    autoFocus
                    name="App_Rnumber"
                    id="App_Rnumber-title"
                    className="form-control form-control-sm"
                    type="text"
                    placeholder=""
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="App_Description-body" className="text-muted mb-1 d-block">
                  <small>App_Description</small>
                </label>
                <textarea
                  value={state.App_Description.value}
                  onChange={e =>
                    dispatch({
                      type: "App_DescriptionImmediately",
                      value: e.target.value
                    })
                  }
                  name="App_Description"
                  id="App_Description-body"
                  className="body-content textarea form-control"
                  type="text"
                ></textarea>
              </div>

              <div className="form-row mb-3">
                <div className="col col-md-4">
                  <label htmlFor="post-title" className="text-muted mb-1"></label>
                  <DatePicker
                    defaultValue={state.App_startDate.initial}
                    views={["year", "month", "day"]}
                    onChange={newValue =>
                      dispatch({
                        type: "App_startDate",
                        value: dayjs(newValue.$d).format("YYYY-MM-DD HH:mm:ss")
                      })
                    }
                    label="App_startDate"
                  />{" "}
                </div>
                <div className="col col-md-4 ">
                  <label htmlFor="post-title" className="text-muted mb-1"></label>
                  <DatePicker
                    defaultValue={state.App_endDate.initial}
                    views={["year", "month", "day"]}
                    onChange={newValue =>
                      dispatch({
                        type: "App_endDate",
                        value: dayjs(newValue.$d).format("YYYY-MM-DD HH:mm:ss")
                      })
                    }
                    label="App_endDate"
                  />
                </div>
                <div className="form-group col-md-3">
                  <label htmlFor="post-title" className="text-muted mb-1">
                    <small>App_permit_Create</small>
                  </label>
                  <Select
                    styles={Styles}
                    isClearable
                    isMulti
                    options={option}
                    value={App_permit_Create}
                    onChange={newValue => {
                      newValue === "" ? setApp_permit_Create(null) : setApp_permit_Create(newValue)
                    }}
                  />
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
                    onChange={newValue => {
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
                    required
                    isMulti
                    options={option}
                    value={App_permit_toDoList}
                    onChange={newValue => {
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
                    onChange={newValue => {
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
                    required
                    options={option}
                    value={App_permit_Done}
                    onChange={newValue => {
                      newValue === "" ? setApp_permit_Done(null) : setApp_permit_Done(newValue)
                    }}
                  />{" "}
                </div>
              </div>
              <button className="btn btn-primary">Update app</button>
            </form>
          </div>
        </div>
      </Page>
    </div>
  )
}

export default AppModal
