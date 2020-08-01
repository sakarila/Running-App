const startRun = () => {
    return {
      type: 'START_RUN'
    };
};
  
const finishRun = () => {
    return {
      type: 'FINISH_RUN'
    }
}
  
const runningUpdates = (data) => {
    return {
      type: 'RUNNING_UPDATES',
      payload: data
    }
}

const notRunningUpdates = (loc) => {
  return {
    type: 'NOT_RUNNING_UPDATES',
    payload: loc
  }
}

const initRun = (loc) => {
    return {
      type: 'INIT_RUN',
      payload: loc
    }
}

const updateElevation = (alt) => {
  return {
    type: 'UPDATE_ELEVATION',
    payload: alt
  }
}

const initState = () => {
  return {
    type: 'INIT_STATE'
  }
}

const saveBackgroundTime = () => {
  return {
    type: "SAVE_BACKGROUND_TIME"
  }
}

const addBackgroundTime = () => {
  return {
    type: "ADD_BACKGROUND_TIME"
  }
}

const addTime = () => {
  return {
    type: "ADD_TIME"
  }
}


module.exports = {
    startRun,
    finishRun,
    runningUpdates,
    notRunningUpdates,
    initRun,
    updateElevation,
    initState,
    saveBackgroundTime,
    addBackgroundTime,
    addTime
};