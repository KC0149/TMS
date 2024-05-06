import React, { useContext, useEffect, useState } from "react"
import Page from "./Page"
import Axios from "axios"
import { Link, useNavigate, useParams } from "react-router-dom"
import StateContext from "../../StateContext"
import DispatchContext from "../../DispatchContext"
import { useImmerReducer } from "use-immer"
import dayjs from "dayjs"
import Select from "react-select"
function CreateTask() {
  const navigate = useNavigate()
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)
  const currentDate = dayjs()
  const formattedDate = currentDate.format("YYYY-MM-DD HH:mm:ss")
  const appName = useParams().id

  const initialState = {
    taskName: {
      value: "",
    },
    Task_description: {
      value: null,
    },
    Task_notes: {
      value: null,
    },
    Task_plan: {
      value: null,
    },
    Task_app_Acronym: appName,

    Task_state: {
      value: "open",
    },
    Task_creator: {
      value: null,
    },
    Task_owner: {
      value: null,
    },
    Task_createDate: {
      value: formattedDate,
    },
    submitCount: 0,
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "taskNameImmediately":
        draft.taskName.value = action.value
        return
      case "Task_descriptionImmediately":
        draft.Task_description.value = action.value
        return
      case "Task_notes":
        draft.Task_notes.value = action.value
        return
      case "Task_plan":
        if (action.value) {
          draft.Task_plan.value = action.value
        }
        console.log(draft.Task_plan.value)
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

    dispatch({ type: "Task_plan", value: selectedValues })
    dispatch({ type: "submitForm" })
  }

  useEffect(() => {
    if (state.submitCount) {
      async function createTask() {
        try {
          const response = await Axios.post("/create-task", { Task_name: state.taskName.value, Task_description: state.Task_description.value, Task_notes: state.Task_notes.value, Task_plan: state.Task_plan.value?.toString(), App_Acronym: state.Task_app_Acronym, Task_state: state.Task_state.value, Task_owner: state.Task_owner.value, Task_createDate: state.Task_createDate.value }) // no need :""  if same as the title
          console.log("new task was created")
          //redirect to taskmanager
          navigate(`/task-management/${appName}`)
          appDispatch({ type: "flashMessages", value: "CONGRATS! YOU CREATED A TASK" })
        } catch (e) {
          if (e.response.status === 403) {
            appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
            navigate(`/task-management/${appName}`)
          } else {
            appDispatch({ type: "flashMessagesError", value: "There was an error creating task. Check inputs" })
          }

          console.log("there was a problem", e)
        }
      }
      createTask()
    }
  }, [state.submitCount])

  //---for plan -------------
  const [option, setOption] = useState([])
  const [value, setValue] = useState([])

  //to view all groups in drop down
  useEffect(() => {
    async function fetchPlans() {
      try {
        const App_Acronym = state.Task_app_Acronym

        Axios.defaults.withCredentials = true
        const response = await Axios.post("/view-plans", { Plan_app_Acronym: App_Acronym })

        const planlist = response.data?.data
        const options = planlist.map((item) => ({
          label: item.Plan_MVP_name,
          value: item.Plan_MVP_name,
        }))

        setOption(options)
      } catch (e) {
        console.log("There was a problem or the request was cancelled.", e.response?.data)
      }
    }
    fetchPlans()
  }, [])

  //only extract the value from the option
  const selectedValues = value === null ? null : value.value

  console.log(state.Task_plan.value)
  const Styles = {
    control: (provided) => ({
      ...provided,
      width: "250px",
    }),
    menu: (provided, state) => ({
      ...provided,
      zIndex: 9999,
      magrinBottom: "2em",
    }),
  }

  return (
    <Page title="Create new Task">
      <Link className="large font-weight-bold pb" to={`/task-management/${appName}`}>
        &laquo;Back
      </Link>
      <div className="card" style={{ width: "80%", margin: "auto" }}>
        <div className="container py-3 mt-2">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="col-md-6 mb-3">
                <label htmlFor="post-title" className="text-muted mb-1">
                  <small>Task Name</small>
                </label>
                <input required onChange={(e) => dispatch({ type: "taskNameImmediately", value: e.target.value })} autoFocus name="title" id="post-title" className="form-control form-control" type="text" placeholder="" autoComplete="off" />
              </div>
              <div className="col-sm-2 mb-3">
                <label htmlFor="post-title" className="text-muted mb-1">
                  <small>Task_app_Acronym</small>
                </label>
                <input value={state.Task_app_Acronym} disabled autoFocus name="title" id="post-title" className="form-control form-control" type="text" placeholder="" autoComplete="off" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="post-body" className="text-muted mb-1 d-block">
                <small>Task_description</small>
              </label>
              <textarea required onChange={(e) => dispatch({ type: "Task_descriptionImmediately", value: e.target.value })} name="body" id="post-body" className="body-content textarea form-control" type="text"></textarea>
            </div>

            <div className=" form-group">
              <label htmlFor="post-title" className="text-muted mb-1">
                <small>Task_notes</small>
              </label>
              <textarea onChange={(e) => dispatch({ type: "Task_notes", value: e.target.value })} name="body" id="post-body" className="body-content textarea form-control" type="text"></textarea>
            </div>
            <div className="form-row">
              <div className="col col-md-4 ">
                <label htmlFor="post-title" className="text-muted mb-1">
                  <small>Task_plan</small>
                </label>
                <Select
                  styles={Styles}
                  isClearable
                  options={option}
                  value={value}
                  onChange={(newValue) => {
                    setValue(newValue)
                  }}
                />
              </div>

              <div className="col col-md-4">
                <label htmlFor="post-title" className="text-muted mb-1">
                  <small>Task_state</small>
                </label>
                <input value={state.Task_state.value} disabled autoFocus name="title" id="post-title" className="form-control form-control" type="text" placeholder="" autoComplete="off" />
              </div>

              <div className="col col-md-4">
                <label htmlFor="post-title" className="text-muted mb-1">
                  <small>Task_createDate</small>
                </label>
                <input value={state.Task_createDate.value} disabled autoFocus name="title" id="post-title" className="form-control form-control-md" type="text" placeholder="" autoComplete="off" />
              </div>
            </div>
            <button className="btn btn-primary mt-3">Create Task</button>
          </form>
        </div>
      </div>
    </Page>
  )
}

export default CreateTask
