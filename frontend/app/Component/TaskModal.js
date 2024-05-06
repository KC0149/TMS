import React, { useContext, useEffect, useState } from "react"
import Page from "./Page"
import { useImmer, useImmerReducer } from "use-immer"
import Axios from "axios"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CSSTransition } from "react-transition-group"
import StateContext from "../../StateContext"
import Select from "react-select"
import dayjs from "dayjs"
import DispatchContext from "../../DispatchContext"

function TaskModal(selectedTask) {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)
  const selectedApp = useParams().id //using the slug to call api of selected app

  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  //---for plan -------------
  const [option, setOption] = useState([])
  const [value, setValue] = useState(
    selectedTask.selectedTask.Task_plan !== null ? { label: selectedTask.selectedTask.Task_plan, value: selectedTask.selectedTask.Task_plan } : null
  ) //cannot use state. instead use the props that was passed
  console.log("selectedTask.selectedTask.Task_plan", selectedTask.selectedTask.Task_plan)
  const initialState = {
    Task_name: {
      value: selectedTask.selectedTask.Task_name
    },
    Task_description: {
      value: selectedTask.selectedTask.Task_description
    },
    Task_notes: {
      value: selectedTask.selectedTask.Task_notes
    },
    New_Task_notes: null,
    Task_plan: {
      value: selectedTask.selectedTask.Task_plan
    },
    Task_app_Acronym: selectedApp,

    Task_state: {
      value: selectedTask.selectedTask.Task_state
    },
    Task_creator: {
      value: selectedTask.selectedTask.Task_creator
    },
    Task_owner: {
      value: selectedTask.selectedTask.Task_owner
    },
    Task_createDate: {
      value: dayjs(selectedTask.selectedTask.Task_createDate).format("YYYY-MM-DD HH:mm:ss")
    },
    Task_id: {
      value: selectedTask.selectedTask.Task_id
    },
    currentState: {
      state: "",
      updateButton: true, //on default disable update button
      planDisable: true, //on default disable plan
      promoteButton: true, //on default disable promote button
      workonButton: true, //on default disable workon button
      demoteButton: true, //on default disable demote button
      doneButton: true, //on default disable complete button
      approveButton: true, //on default disable approve button
      rejectButton: true //on default disable hidden button
    },
    promoteSubmit: false,
    workOnSubmit: false,
    doingSubmit: false,
    closeSubmit: false,
    stopSubmit: false,
    rejectSubmit: false,
    submitCount: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "Task_nameImmediately":
        draft.Task_name = action.value
        return
      case "Task_descriptionImmediately":
        draft.Task_description = action.value
        return
      case "New_Task_notes":
        draft.New_Task_notes = action.value

        return
      case "Task_plan":
        draft.Task_plan = action.value

        return
      case "Task_app_Acronym":
        draft.Task_app_Acronym = action.value
        return
      case "Task_state":
        draft.Task_state === "" ? null : action.value
        return
      case "Task_creator":
        draft.Task_creator === "" ? null : action.value //do in back end
        return
      case "Task_owner":
        draft.Task_owner === "" ? null : action.value
        return
      case "Task_createDate":
        draft.Task_createDate === "" ? null : action.value
        return
      //open state --- can promote task to todo
      case "openState":
        draft.currentState.state = "open"
        draft.currentState.planDisable = false //allow plan change
        draft.currentState.promoteButton = false //show promote button
        draft.currentState.updateButton = false
        return
      case "promote":
        draft.promoteSubmit = true
        return
      //------Todo state----- workon task to doingstate
      case "todoState":
        draft.currentState.state = "todo"
        draft.currentState.updateButton = false
        draft.currentState.workonButton = false //show workon button
        return
      case "workOn":
        draft.workOnSubmit = true
        return
      //--------- doing state ------------ complete task to done state or demote to todo state
      case "doingState":
        draft.currentState.state = "doing"
        draft.currentState.updateButton = false
        draft.currentState.demoteButton = false //show demote button
        draft.currentState.doneButton = false // show complete button
        return
      case "complete":
        draft.doingSubmit = true
        return
      case "stop":
        draft.stopSubmit = true
        return
      //--------------done state-------------- approval to close
      case "doneState":
        draft.currentState.state = "done"
        draft.currentState.rejectButton = false //show demote button
        draft.currentState.approveButton = false // show complete button
        draft.currentState.updateButton = false

        return
      case "close":
        draft.currentState.state = "close"
        draft.closeSubmit = true
        return
      case "changePlan": //PL only
        draft.currentState.planDisable = !draft.currentState.planDisable
        draft.currentState.approveButton = !draft.currentState.approveButton
        draft.currentState.updateButton = !draft.currentState.updateButton
        const cb = document.querySelector("#changePlan")
        console.log("taa", cb.checked) // false
        if (!cb.checked) {
          setValue({ label: selectedTask.selectedTask.Task_plan, value: selectedTask.selectedTask.Task_plan })
        } else {
          setValue([{ label: selectedTask.selectedTask.Task_plan, value: selectedTask.selectedTask.Task_plan }])
        }
        return

      case "reject":
        draft.rejectSubmit = true
        return
      //--------------only view task--------------
      case "viewTask":
        draft.currentState.updateButton = true
        return
      //-----------------------------------------------------------------------
      case "submitForm":
        draft.submitCount++
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  //------ check permit -------
  useEffect(() => {
    async function isPermit() {
      if (selectedTask.selectedTask.Task_state === "close") {
        dispatch({ type: "viewTask" })
      } else {
        try {
          // need to add this to get cookies
          Axios.defaults.withCredentials = true
          const response = await Axios.post("/check-permit", { App_Acronym: selectedApp, Task_state: selectedTask.selectedTask.Task_state })
          if (response.data) {
            if (selectedTask.selectedTask.Task_state === "open") {
              dispatch({ type: "openState" })
            }
            if (selectedTask.selectedTask.Task_state === "todo") {
              dispatch({ type: "todoState" })
            }
            if (selectedTask.selectedTask.Task_state === "doing") {
              dispatch({ type: "doingState" })
            }
            if (selectedTask.selectedTask.Task_state === "done") {
              dispatch({ type: "doneState" })
            }
          }
        } catch (e) {
          dispatch({ type: "viewTask" })
        }
      }
    }
    isPermit()
  }, [])

  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler)
    return () => document.removeEventListener("keyup", searchKeyPressHandler)
  }, [])

  //closing edit with escape key
  function searchKeyPressHandler(e) {
    if (e.keyCode == 27) {
      appDispatch({ type: "closeTaskModal" })
    }
  }

  const currentDateTime = dayjs().format("YYYY-MM-DD HH:mm:ss")

  // //---for plan -------------
  // const [option, setOption] = useState([]);
  // const [value, setValue] = useState(selectedTask.selectedTask.Task_plan !== null ? [{ label: selectedTask.selectedTask.Task_plan, value: selectedTask.selectedTask.Task_plan }] : []); //cannot use state. instead use the props that was passed

  //to view all groups in drop down
  useEffect(() => {
    async function fetchPlans() {
      try {
        const App_Acronym = state.Task_app_Acronym

        Axios.defaults.withCredentials = true
        const response = await Axios.post("/view-plans", { Plan_app_Acronym: App_Acronym })

        const planlist = response.data.data
        const options = planlist.map(item => ({
          label: item.Plan_MVP_name,
          value: item.Plan_MVP_name
        }))

        setOption(options)
      } catch (e) {
        console.log("There was a problem or the request was cancelled.")
      }
    }
    fetchPlans()
  }, [])
  console.log(value?.value)
  //only extract the value from the option
  const selectedValues = value === null ? null : value.value
  console.log(selectedValues)

  const Styles = {
    control: provided => ({
      ...provided,
      width: "250px"
    }),
    menu: (provided, state) => ({
      ...provided,
      zIndex: 9999
    })
  }

  //-----------------------------------------------------------------------
  async function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "Task_plan", value: selectedValues })
    dispatch({ type: "submitForm" })
  }

  //-----------------------------------------------------------------------
  useEffect(() => {
    if (state.submitCount) {
      async function updateTask() {
        try {
          console.log(selectedApp)
          const response = await Axios.post("/update-task", {
            Task_id: state.Task_id.value,
            Task_notes: state.New_Task_notes,
            Task_plan: state.Task_plan?.toString(),
            updateTime: currentDateTime,
            Task_state: state.Task_state.value,
            App_Acronym: selectedApp
          }) // no need :""  if same as the title
          console.log("task updated")
          appDispatch({ type: "flashMessages", value: "CONGRATS! You have updated a task successfully" })
          if (state.promoteSubmit === true) {
            await handlePromote()
          }

          if (state.workOnSubmit === true) {
            await handleWorkon()
          }

          if (state.doingSubmit === true) {
            await handleDone()
          }
          if (state.closeSubmit === true) {
            await handleClose()
          }
          if (state.stopSubmit === true) {
            await handleStop()
          }
          if (state.rejectSubmit === true) {
            await handleReject()
          }

          //redirect to taskmanager
          appDispatch({ type: "closeTaskModal" })
          appDispatch({ type: "taskEdited" })
          window.scrollTo(0, 0)
        } catch (e) {
          if (e.response.status === 403) {
            appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
            appDispatch({ type: "closeTaskModal" })
          } else {
            appDispatch({ type: "flashMessagesError", value: "There was an error. Check inputs" })
            console.log("there was a problem", e)
          }
        }
      }
      updateTask()
    }
  }, [state.submitCount])

  //----------------------------------promote task--------------------------- open to todo

  async function handlePromote() {
    try {
      const response = await Axios.post("/promote", {
        Task_id: state.Task_id.value,
        promoteTime: currentDateTime,
        Task_state: state.Task_state.value,
        App_Acronym: selectedApp
      }) // no need :""  if same as the title
      console.log("task updated")
      //redirect to taskmanager
      appDispatch({ type: "closeTaskModal" })

      appDispatch({ type: "flashMessages", value: "CONGRATS! You have promoted a task!" })
    } catch (e) {
      if (e.response.status === 408) {
        appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
        appDispatch({ type: "closeTaskModal" })
      } else {
        appDispatch({ type: "flashMessagesError", value: "There was an error creating user. Check inputs" })
        console.log("there was a problem", e)
      }
    }
  }
  //--------------------------work on task(add owner) // only by dev--------------------todo to doing
  async function handleWorkon() {
    try {
      const response = await Axios.post("/promote", {
        Task_id: state.Task_id.value,
        promoteTime: currentDateTime,
        Task_state: state.Task_state.value,
        App_Acronym: selectedApp
      }) // no need :""  if same as the title
      console.log("task workon to doing state")
      //redirect to taskmanager
      appDispatch({ type: "closeTaskModal" })

      appDispatch({ type: "flashMessages", value: "CONGRATS! You have started a task!" })
    } catch (e) {
      if (e.response.status === 408) {
        appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
        appDispatch({ type: "closeTaskModal" })
      } else {
        appDispatch({ type: "flashMessagesError", value: "There was an error creating user. Check inputs" })
        console.log("there was a problem", e)
      }
    }
  }

  //------------stop task by dev ---------------------- doing to do
  async function handleStop() {
    try {
      const response = await Axios.post("/demote", {
        Task_id: state.Task_id.value,
        promoteTime: currentDateTime,
        Task_state: state.Task_state.value,
        Task_plan: state.Task_plan,
        App_Acronym: selectedApp
      }) // no need :""  if same as the title
      console.log("task doing to todo state")
      //redirect to taskmanager
      appDispatch({ type: "closeTaskModal" })
      appDispatch({ type: "flashMessages", value: "You have stop a task successfully" })
    } catch (e) {
      if (e.response.status === 408) {
        appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
        appDispatch({ type: "closeTaskModal" })
      } else {
        appDispatch({ type: "flashMessagesError", value: "There was an error creating user. Check inputs" })
        console.log("there was a problem", e)
      }
    }
  }
  //------------complete task by dev team---------------------- doing to done
  async function handleDone() {
    try {
      const response = await Axios.post("/promote", {
        Task_name: state.Task_name.value,
        Task_id: state.Task_id.value,
        promoteTime: currentDateTime,
        Task_state: state.Task_state.value,
        App_Acronym: selectedApp,
        Task_plan: state.Task_plan
      }) // no need :""  if same as the title
      console.log("task doing to done state")
      //redirect to taskmanager
      appDispatch({ type: "closeTaskModal" })

      appDispatch({ type: "flashMessages", value: "CONGRATS! You have completed a task!" })
    } catch (e) {
      if (e.response.status === 408) {
        appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
        appDispatch({ type: "closeTaskModal" })
      } else {
        appDispatch({ type: "flashMessagesError", value: "There was an error creating user. Check inputs" })
        console.log("there was a problem", e)
      }
    }
  }

  //------------close task by PL ---------------------- done to close
  async function handleClose() {
    try {
      const response = await Axios.post("/promote", {
        Task_id: state.Task_id.value,
        promoteTime: currentDateTime,
        Task_state: state.Task_state.value,
        App_Acronym: selectedApp
      }) // no need :""  if same as the title
      console.log("task done to close state")
      //redirect to taskmanager
      appDispatch({ type: "closeTaskModal" })
      appDispatch({ type: "flashMessages", value: "CONGRATS! You have close a task successfully" })
    } catch (e) {
      if (e.response.status === 408) {
        appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
        appDispatch({ type: "closeTaskModal" })
      } else {
        appDispatch({ type: "flashMessagesError", value: "There was an error creating user. Check inputs" })
        console.log("there was a problem", e)
      }
    }
  }

  //------------reject task by PL ---------------------- done to doing
  async function handleReject() {
    try {
      const response = await Axios.post("/demote", {
        Task_id: state.Task_id.value,
        promoteTime: currentDateTime,
        Task_state: state.Task_state.value,
        Task_plan: state.Task_plan,
        App_Acronym: selectedApp
      }) //need App_Acronym for middleware
      console.log("task done to doing state")
      //redirect to taskmanager
      appDispatch({ type: "closeTaskModal" })
      appDispatch({ type: "flashMessages", value: "You have rejected a task successfully" })
    } catch (e) {
      if (e.response.status === 408) {
        appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
        appDispatch({ type: "closeTaskModal" })
      } else {
        appDispatch({ type: "flashMessagesError", value: "There was an error creating user. Check inputs" })
        console.log("there was a problem", e)
      }
    }
  }
  console.log(state.Task_plan)
  //-------------------------------------------------------------------------

  return (
    <div className="search-overlay">
      <div title="Edit Task" className="mt-5">
        <span onClick={e => appDispatch({ type: "closeTaskModal" })} className="close-live-search">
          <i className="fas fa-times-circle"></i>
        </span>
        <div className="card taskcard ">
          <div className="mr-5 ml-5 my-3">
            <form onSubmit={handleSubmit}>
              <div className="row ml-5">
                <div className="col-md-3">
                  <div className="form-group">
                    <label htmlFor="post-title" className="text-muted mb-1">
                      <small>Task Name</small>
                    </label>
                    <input
                      value={state.Task_name.value}
                      disabled
                      autoFocus
                      name="title"
                      id="post-title"
                      className="form-control"
                      type="text"
                      placeholder=""
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="post-title" className="text-muted mb-1">
                      <small>Task_app_Acronym</small>
                    </label>
                    <input
                      value={state.Task_app_Acronym}
                      disabled
                      autoFocus
                      name="title"
                      id="post-title"
                      className="form-control"
                      type="text"
                      placeholder=""
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="post-title" className="text-muted mb-1">
                      <small>Task_id</small>
                    </label>
                    <input
                      value={state.Task_id.value}
                      disabled
                      autoFocus
                      name="title"
                      id="post-title"
                      className="form-control"
                      type="text"
                      placeholder=""
                      autoComplete="off"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="post-title" className="text-muted mb-1">
                      <small>Task_state</small>
                    </label>
                    <input
                      disabled
                      value={state.Task_state.value}
                      autoFocus
                      name="title"
                      id="post-title"
                      className="form-control"
                      type="text"
                      placeholder=""
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="post-title" className="text-muted mb-1">
                      <small>Task_owner</small>
                    </label>
                    <input
                      disabled
                      value={state.Task_owner.value}
                      autoFocus
                      name="title"
                      id="post-title"
                      className="form-control"
                      type="text"
                      placeholder=""
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="post-title" className="text-muted mb-1">
                      <small>Task_createDate</small>
                    </label>
                    <input
                      value={state.Task_createDate.value}
                      disabled
                      autoFocus
                      name="title"
                      id="post-title"
                      className="form-control"
                      type="text"
                      placeholder=""
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="post-title" className="text-muted mb-1">
                      <small>Task_plan</small>
                    </label>
                    <Select
                      styles={Styles}
                      isClearable
                      options={option}
                      value={value}
                      onChange={newValue => {
                        newValue === "" ? setValue(null) : setValue(newValue)
                      }}
                      isDisabled={state.currentState.planDisable}
                    />
                    {state.currentState.state === "done" ? (
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="changePlan"
                          onChange={e => {
                            dispatch({ type: "changePlan" })
                          }}
                        />
                        <label className="form-check-label" htmlFor="changePlan">
                          Edit plan?
                        </label>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="col-md-9">
                  <div className="form-group">
                    <label htmlFor="post-body" className="text-muted mb-1 d-block">
                      <small>Task_description</small>
                    </label>
                    <textarea
                      value={state.Task_description.value}
                      disabled
                      name="body"
                      id="post-body"
                      className="body-content textarea form-control"
                      rows={"6"}
                      type="text"
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="post-title" className="text-muted mb">
                      <small>Task_notes</small>
                    </label>
                    <textarea
                      value={state.Task_notes.value}
                      disabled
                      name="body"
                      id="post-body"
                      className="body-content textarea form-control"
                      rows={"9"}
                      type="text"
                    ></textarea>
                    <textarea
                      onChange={e => dispatch({ type: "New_Task_notes", value: e.target.value })}
                      name="body"
                      id="post-body"
                      className="body-content textarea form-control"
                      rows={"5"}
                      placeholder="Add a note"
                      type="text"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="form-row mt-2 mb-1 ">
                <div className="col-md-12 d-flex justify-content-between">
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      dispatch({ type: "stop" })
                    }}
                    hidden={state.currentState.demoteButton}
                  >
                    Stop Task
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      dispatch({ type: "reject" })
                    }}
                    hidden={state.currentState.rejectButton}
                  >
                    Reject Task
                  </button>
                  <button hidden={state.currentState.updateButton} className="btn btn-info">
                    Update Task
                  </button>
                  <button
                    onClick={() => {
                      dispatch({ type: "promote" })
                    }}
                    className="btn btn-success"
                    hidden={state.currentState.promoteButton}
                  >
                    Release Task
                  </button>
                  <button
                    onClick={() => {
                      dispatch({ type: "workOn" })
                    }}
                    className="btn btn-success"
                    hidden={state.currentState.workonButton}
                  >
                    Start Task
                  </button>
                  <button
                    onClick={() => {
                      dispatch({ type: "complete" })
                    }}
                    className="btn btn-success"
                    hidden={state.currentState.doneButton}
                  >
                    Submit Task
                  </button>
                  <button
                    onClick={() => {
                      dispatch({ type: "close" })
                    }}
                    className="btn btn-success"
                    hidden={state.currentState.approveButton}
                  >
                    Approve Task
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskModal
