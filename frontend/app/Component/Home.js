import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DispatchContext from "../../DispatchContext";
import Page from "./Page";
import Axios from "axios";
import StateContext from "../../StateContext";
import TaskModal from "./TaskModal";
import { useImmerReducer } from "use-immer";

function Home() {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState([]);
  const selectedApp = useParams().id; //using the slug to call api of selected app
  const navigate = useNavigate();

  const initialState = {
    createPermit: false,
    managePlan: false
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "createPermit":
        draft.createPermit = true;
        return;
      case "managePlan":
        draft.managePlan = true;
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  //-----------------check if Active----
  async function handleManagePlan() {
    try {
      // need to add this to get cookies
      Axios.defaults.withCredentials = true;
      const response = await Axios.post("/checkPm");
    } catch (e) {
      appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" });
      navigate(`/task-management/${selectedApp}`);
      console.log("There was a problem or the request was cancelled.", e);
    }
  }

  //-----------------check if Active----
  async function handleCreateTask() {
    try {
      // need to add this to get cookies
      Axios.defaults.withCredentials = true;
      const response = await Axios.post("/check-permit", { App_Acronym: selectedApp, Task_state: "create" });
    } catch (e) {
      appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" });
      navigate(`/task-management/${selectedApp}`);
      console.log("There was a problem or the request was cancelled.", e);
    }
  }

  //-----------------check if Permit Create------------------
  useEffect(() => {
    async function checkPermitCreate() {
      try {
        // need to add this to get cookies
        Axios.defaults.withCredentials = true;
        const response = await Axios.post("/check-permit", { App_Acronym: selectedApp, Task_state: "create" });
        dispatch({ type: "createPermit" });
      } catch (e) {
        console.log("There was a problem or the request was cancelled.", e);
      }
    }
    checkPermitCreate();
  }, []);

  //-----------------check if PM------------------
  useEffect(() => {
    async function checkIsPm() {
      try {
        // need to add this to get cookies
        Axios.defaults.withCredentials = true;
        const response = await Axios.post("/checkPm");
        dispatch({ type: "managePlan" });
      } catch (e) {
        console.log("There was a problem or the request was cancelled.", e);
      }
    }
    checkIsPm();
  }, []);

  //----------------fetch all task----------------------------------------
  useEffect(() => {
    async function fetchTasks() {
      try {
        // need to add this to get cookies
        Axios.defaults.withCredentials = true;

        const response = await Axios.post("/view-tasks", { App_Acronym: selectedApp });
        console.log(response);
        //no response means should logout
        if (response.data) {
          setTasks(response.data.data);
        }
      } catch (e) {
        console.log("There was a problem or the request was cancelled.", e);
      }
    }
    fetchTasks();
  }, [appState.taskEdited]);

  //-------- Organize tasks-----------------------
  const openTasks = tasks?.filter(task => task.Task_state === "open");
  const toDoTasks = tasks?.filter(task => task.Task_state === "todo");
  const doingTasks = tasks?.filter(task => task.Task_state === "doing");
  const doneTasks = tasks?.filter(task => task.Task_state === "done");
  const closeTasks = tasks?.filter(task => task.Task_state === "close");

  const handleShowModal = (e, Task_id, task) => {
    setSelectedTask(task);
    appDispatch({ type: "openTaskModal", value: Task_id });
  };

  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = taskId => {
    setIsChecked(prevChecked => ({
      ...prevChecked,
      [taskId]: !prevChecked[taskId]
    }));
  };

  return (
    <div className="task-home">
      {/* <Page title={"Task Manager"}> */}
      {/*-------------------for project lead---------------*/}
      <div className=" task-board">
        <h1 className=" task-app ">{selectedApp} board</h1>

        <div className=" info-box">
          <Link to={`/`}>
            <button className="btn btn-sm btn-primary mr-5 m-2">Back</button>
          </Link>
          {state.createPermit && ( //only in app_permit_create group can see
            <Link to={`/create-task/${selectedApp}`}>
              <button onClick={handleCreateTask} className="btn btn-sm btn-warning mr-5 m-2">
                Create task
              </button>
            </Link>
          )}
          {state.managePlan && ( //only pm group can see
            <Link to={`/plans/${selectedApp}`}>
              <button onClick={handleManagePlan} className="btn btn-sm btn-warning mr-5 m-2">
                Manage plans
              </button>
            </Link>
          )}
        </div>
      </div>
      {/*----------------------Open Tasks--------------------------*/}

      <div className="home">
        <div className="state" id="open">
          <strong>Open</strong>
          <hr className="custom-hr" />
          {openTasks?.map(task => (
            <div className="task" style={{ background: task.Task_color ? task.Task_color : " rgba(255, 255, 255, 0.49)" }} key={task.Task_id}>
              <div className="task-content">
                <label className="container-tick">
                  <input type="checkbox" id={`checkbox-${task.Task_id}`} onChange={() => handleCheckboxChange(task.Task_id)} checked={isChecked[task.Task_id] || false} />
                  <div className="line"></div>
                  <div className="line line-indicator"></div>
                </label>
                <div className={`task-info `} style={{ flexDirection: isChecked[task.Task_id] ? "column" : "row" }}>
                  <span className="font-weight-bold task-name">
                    <u>{task.Task_name}</u>
                  </span>
                  <span style={{ display: isChecked[task.Task_id] ? "inline" : "none" }}>Task Id: {task.Task_id}</span>
                  <span style={{ display: isChecked[task.Task_id] ? "inline" : "none" }}>Task Plan: {task.Task_plan ? task.Task_plan : "No plan"}</span>
                  <span style={{ display: isChecked[task.Task_id] ? "inline" : "none" }}>Owner: {task.Task_owner}</span>
                </div>
                <button type="button" className="btn btn-dark btn-sm ml-2 " onClick={e => handleShowModal(e, task.Task_id, task)}>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
        {/*----------------------Todo state --------------------------*/}

        <div className="state" id="doing">
          <strong>Todo</strong>
          <hr className="custom-hr" />
          {toDoTasks?.map(task => (
            <div className="task" style={{ background: task.Task_color ? task.Task_color : " rgba(255, 255, 255, 0.49)" }} key={task.Task_id}>
              <div className="task-content">
                <label className="container-tick">
                  <input type="checkbox" id={`checkbox-${task.Task_id}`} onChange={() => handleCheckboxChange(task.Task_id)} checked={isChecked[task.Task_id] || false} />
                  <div className="line"></div>
                  <div className="line line-indicator"></div>
                </label>
                <div className={`task-info `} style={{ flexDirection: isChecked[task.Task_id] ? "column" : "row" }}>
                  <span className="font-weight-bold task-name">
                    <u>{task.Task_name}</u>
                  </span>
                  <span style={{ display: isChecked[task.Task_id] ? "inline" : "none" }}>Task Id: {task.Task_id}</span>
                  <span style={{ display: isChecked[task.Task_id] ? "inline" : "none" }}>Task Plan: {task.Task_plan ? task.Task_plan : "No plan"}</span>
                  <span style={{ display: isChecked[task.Task_id] ? "inline" : "none" }}>Owner: {task.Task_owner}</span>
                </div>
                <button type="button" className="btn btn-dark btn-sm ml-2 " onClick={e => handleShowModal(e, task.Task_id, task)}>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
        {/*----------------------Doing state --------------------------*/}

        <div className="state" id="doing">
          <strong>Doing</strong>
          <hr className="custom-hr" />
          {doingTasks?.map(task => (
            <div className="task" style={{ background: task.Task_color ? task.Task_color : " rgba(255, 255, 255, 0.49)" }} key={task.Task_id}>
              <div className="task-content">
                <label className="container-tick">
                  <input type="checkbox" id={`checkbox-${task.Task_id}`} onChange={() => handleCheckboxChange(task.Task_id)} checked={isChecked[task.Task_id] || false} />
                  <div className="line"></div>
                  <div className="line line-indicator"></div>
                </label>
                <div className={`task-info `} style={{ flexDirection: isChecked[task.Task_id] ? "column" : "row" }}>
                  <span className="font-weight-bold task-name">
                    <u>{task.Task_name}</u>
                  </span>
                  <span style={{ display: isChecked[task.Task_id] ? "inline" : "none" }}>Task Id: {task.Task_id}</span>
                  <span style={{ display: isChecked[task.Task_id] ? "inline" : "none" }}>Task Plan: {task.Task_plan ? task.Task_plan : "No plan"}</span>
                  <span style={{ display: isChecked[task.Task_id] ? "inline" : "none" }}>Owner: {task.Task_owner}</span>
                </div>
                <button type="button" className="btn btn-dark btn-sm ml-2 " onClick={e => handleShowModal(e, task.Task_id, task)}>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
        {/*----------------------Done state --------------------------*/}
        <div className="state" id="done">
          <strong>Done</strong>
          <hr className="custom-hr" />
          {doneTasks?.map(task => (
            <div className="task" style={{ background: task.Task_color ? task.Task_color : " rgba(255, 255, 255, 0.49)" }} key={task.Task_id}>
              <div className="task-content">
                <label className="container-tick">
                  <input type="checkbox" id={`checkbox-${task.Task_id}`} onChange={() => handleCheckboxChange(task.Task_id)} checked={isChecked[task.Task_id] || false} />
                  <div className="line"></div>
                  <div className="line line-indicator"></div>
                </label>
                <div className={`task-info `} style={{ flexDirection: isChecked[task.Task_id] ? "column" : "row" }}>
                  <span className="font-weight-bold task-name">
                    <u>{task.Task_name}</u>
                  </span>
                  <span style={{ display: isChecked[task.Task_id] ? "inline" : "none" }}>Task Id: {task.Task_id}</span>
                  <span style={{ display: isChecked[task.Task_id] ? "inline" : "none" }}>Task Plan: {task.Task_plan ? task.Task_plan : "No plan"}</span>
                  <span style={{ display: isChecked[task.Task_id] ? "inline" : "none" }}>Owner: {task.Task_owner}</span>
                </div>
                <button type="button" className="btn btn-dark btn-sm ml-2 " onClick={e => handleShowModal(e, task.Task_id, task)}>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
        {/*----------------------Close state --------------------------*/}
        <div className="state" id="close">
          <strong>Close</strong>
          <hr className="custom-hr" />
          {closeTasks?.map(task => (
            <div className="task" style={{ background: task.Task_color ? task.Task_color : " rgba(255, 255, 255, 0.49)" }} key={task.Task_id}>
              <div className="task-content">
                <label className="container-tick">
                  <input type="checkbox" id={`checkbox-${task.Task_id}`} onChange={() => handleCheckboxChange(task.Task_id)} checked={isChecked[task.Task_id] || false} />
                  <div className="line"></div>
                  <div className="line line-indicator"></div>
                </label>
                <div className={`task-info `} style={{ flexDirection: isChecked[task.Task_id] ? "column" : "row" }}>
                  <span className="font-weight-bold task-name">
                    <u>{task.Task_name}</u>
                  </span>
                  <span style={{ display: isChecked[task.Task_id] ? "inline" : "none" }}>Task Id: {task.Task_id}</span>
                  <span style={{ display: isChecked[task.Task_id] ? "inline" : "none" }}>Task Plan: {task.Task_plan ? task.Task_plan : "No plan"}</span>
                  <span style={{ display: isChecked[task.Task_id] ? "inline" : "none" }}>Owner: {task.Task_owner}</span>
                </div>
                <button type="button" className="btn btn-dark btn-sm ml-2 " onClick={e => handleShowModal(e, task.Task_id, task)}>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {appState.openTaskModal && <TaskModal selectedTask={selectedTask} />}
      {/* </Page> */}
    </div>
  );
}

export default Home;
