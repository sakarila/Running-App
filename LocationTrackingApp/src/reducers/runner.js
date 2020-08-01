const initialState = {
    latitude: 0,
    longitude: 0,
    curSpeed: 0,
    avgSpeed: 0,
    prevCoordinate: null,
    distanceTravelled: 0,
    prevAltitude: null,
    elevation: 0,
    coordinates: [],
    time: 0,
    backgroundTime: null,
    timer: null,
    running: false,
    weight: 0
};

const runnerReducer = (state=initialState, action) => {
    switch(action.type){
      case "INIT_STATE":
        return state;
      case "INIT_RUN":
        return {
          ...state,
          weight: action.payload.weight,
          longitude: action.payload.longitude,
          latitude: action.payload.latitude, 
          prevCoordinate: action.payload.prevCoordinate,
          prevAltitude: action.payload.prevAltitude
        };
      case "START_RUN":
        return {
          ...state,
          running: true,
          elevation: 0,
          coordinates: [],
          time: 0,
          distanceTravelled: 0
        };
      case "FINISH_RUN":
        return {
          ...state,
          running: false,
        }
      case "RUNNING_UPDATES":
        return {
          ...state,
          distanceTravelled: action.payload.distanceTravelled,
          coordinates: action.payload.coordinates,
          avgSpeed: action.payload.avgSpeed
        }
      case "UPDATE_ELEVATION":
        return {
          ...state,
          elevation: (action.payload - state.prevAltitude)
        }
      case "NOT_RUNNING_UPDATES":
        return {
          ...state,
          longitude: action.payload.longitude,
          latitude: action.payload.latitude, 
          prevCoordinate: action.payload.prevCoordinate,
          prevAltitude: action.payload.prevAltitude,
          curSpeed: action.payload.curSpeed
        }
      case "SAVE_BACKGROUND_TIME":
        const startDate = new Date();
        return {
          ...state,
          backgroundTime: startDate
        }
      case "ADD_BACKGROUND_TIME":
        const finishDate = new Date();
        return {
          ...state,
          time: state.time + ((finishDate - state.backgroundTime) / 1000)
        }
      case "ADD_TIME":
        return {
          ...state,
          time: state.time + 1
        }
      default:
          return state;
    }
  }

export default runnerReducer;