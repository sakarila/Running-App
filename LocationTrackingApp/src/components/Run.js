import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, AppState} from 'react-native';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import MapView, {Polyline} from 'react-native-maps';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Col, Row, Grid } from "react-native-easy-grid";
import {connect} from 'react-redux';
import {startRun, finishRun, runningUpdates, notRunningUpdates, initRun, initState, updateElevation, addTime, addBackgroundTime, saveBackgroundTime} from '../actions/runner'
import {formatDate, toHHMMSS, parseLocation, calcDistance} from "../helpers";
import store from '../store';


class Run extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userID: null,
            token: null,
            timer: null
        };
    }

    async componentDidMount() {

        const { userID } = this.props.route.params;
        const { token } = this.props.route.params;
        const { weight } = this.props.route.params;
        const { status } = await Permissions.askAsync(Permissions.LOCATION);

        this.setState({userID, token});

        if (status === 'granted') {
           
            const location = await Location.getCurrentPositionAsync({});
            const [lat, lon, newCoordinate, alt] = parseLocation(location);
            const loc = {latitude: lat, longitude: lon, prevCoordinate: newCoordinate, prevAltitude: alt, weight: weight};
            this.props.dispatch(initRun(loc))
            
            await Location.startLocationUpdatesAsync('background-location',
                { timeInterval: 2000, distanceInterval: 0, accuracy: Location.Accuracy.High,
                foregroundService: {notificationTitle: "LocationTrackingApp", notificationBody: "Run is active on the background"}});
            
        } else {
            this._signOut();
        }
    };

    async componentWillUnmount() {
        if(this.props.coordinates.length > 1 && this.props.running == true) {
            this._stopGetLocationAsync();
            this._finishRun();
        } else {
            this._stopGetLocationAsync();
        }
        this.props.dispatch(initState());
     };

    _stopGetLocationAsync = async () => {
        await Location.stopLocationUpdatesAsync('background-location');
    };

    _calcCalories = () => {
        // Very rough estimate
        return (Math.round(0.0175 * this.props.avgSpeed * this.props.weight * (this.props.time / 60)));
    };

    _getRegion = () => {
        return {
            latitude: this.props.latitude,
            longitude: this.props.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002
        }
      }

    _startRun = () => {
        const timer = setInterval(() => {
            store.dispatch(addTime());
        }, 1000)
        this.setState({timer: timer})
        this.props.dispatch(startRun());
    }
    
    _startFinishRun = () => {
        if (this.props.running) {
            this._finishRun();
        } else {
            this._startRun();
        }
    }

    _finishRun = () => {
        this.props.dispatch(finishRun());
        clearInterval(this.state.timer);

        const date = formatDate();
        const state = store.getState();

        fetch('https://locationtrackingapp.herokuapp.com/run', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.state.token}`
            },
            body: JSON.stringify({
                date: date,
                userid: parseInt(this.state.userID),
                time: Math.round(state.time),
                altitude:  Math.round(state.elevation),
                distance:  Math.round(state.distanceTravelled),
                calories: this._calcCalories(),
                coordinates: state.coordinates
            }),
          })
          .then((response) => response.json())
          .then((json) => {
            Alert.alert("", "Run finished!")
          })
          .catch((error) => {
            // Error handling
          });
    }

    _navigateToHistoryRuns = () => {
        this.props.navigation.navigate('HistoryRuns', {userID: this.state.userID, token: this.state.token});
    }

    _signOut = () => {
        this.props.navigation.pop();
    }

    render() {
        return (
        <View style={styles.container}>
            <View style={styles.navigationBar}>
                <TouchableOpacity style={styles.navigationButton} onPress={this._signOut}>
                    <Text style={styles.buttonText}>SIGN OUT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navigationButton} onPress={this._navigateToHistoryRuns}>
                    <Text style={styles.buttonText}>RUN HISTORY</Text>
                </TouchableOpacity>
            </View>
            <MapView style={styles.mapStyle} showsUserLocation followsUserLocation region={this._getRegion()} >
            <Polyline coordinates={this.props.coordinates} strokeWidth={5} />
            </MapView>
            <View style={styles.info}>
                <View style={styles.control}>
                    <TouchableOpacity style={styles.buttonContainer} onPress={this._startFinishRun}>
                        <Text style={styles.buttonText}>{this.props.running ? "FINISH" : "START"}</Text>
                    </TouchableOpacity>
                </View>
                <Grid style={styles.stats}>
                    <Col>
                        <Row style={styles.statBox}><Text style={styles.statsText}>Distance {'\n'} {(Math.round(this.props.distanceTravelled / 10))/100} km</Text></Row>
                        <Row style={styles.statBox}><Text style={styles.statsText}>Speed{'\n'} {(Math.round(this.props.curSpeed)*10)/10} km/h</Text></Row>
                    </Col>
                    <Col>
                        <Row style={styles.statBox}><Text style={styles.statsText}>Elevation {'\n'} {Math.round(this.props.elevation)} m</Text></Row> 
                        <Row style={styles.statBox}><Text style={styles.statsText}>Time {'\n'} {toHHMMSS(this.props.time)}</Text></Row>                   
                    </Col>
                    <Col>
                        <Row style={styles.statBox}><Text style={styles.statsText}>Avg speed {'\n'} {(Math.round(this.props.avgSpeed)*10)/10} km/h</Text></Row> 
                        <Row style={styles.statBox}><Text style={styles.statsText}>Calories {'\n'} {this._calcCalories()} kcal</Text></Row>
                    </Col>
                </Grid>
            </View>
        </View>
        );
    }
}

const backgroundTimer = () => {
    const state = store.getState();
    if (state.running) {
        if (AppState.currentState === "background") {
            store.dispatch(saveBackgroundTime())
        } else if (AppState.currentState === "active") {
            store.dispatch(addBackgroundTime())
        }
    }
}

AppState.addEventListener('change', backgroundTimer);

TaskManager.defineTask('background-location', ({ data, error }) => {
    const state = store.getState();
    if (error) {
      // Error occurred - check `error.message` for more details.
      return;
    }
    if (data) {
        const loc = data.locations[0];
        const [lat, lon, newCoordinate, alt, speed] = parseLocation(loc);
        const location = {latitude: lat, longitude: lon, prevCoordinate: newCoordinate, prevAltitude: alt, curSpeed: speed};

        if (state.running) {

            const distanceTravelled = state.distanceTravelled + calcDistance(state.prevCoordinate, newCoordinate);
            const coordinates = state.coordinates.concat(newCoordinate);
            const avgSpeed = (state.distanceTravelled / state.time)*3.6;

            const data = {distanceTravelled: distanceTravelled, coordinates: coordinates, avgSpeed: avgSpeed};
            store.dispatch(runningUpdates(data));

            if (alt > state.prevAltitude) {
                store.dispatch(updateElevation(alt));
            }
        }
        store.dispatch(notRunningUpdates(location));
    }
});


const mapStateToProps = (state) => {
    return {
        latitude: state.latitude,
        longitude: state.longitude,
        curSpeed: state.curSpeed,
        avgSpeed: state.avgSpeed,
        prevCoordinate: state.prevCoordinate,
        distanceTravelled: state.distanceTravelled,
        prevAltitude: state.prevAltitude,
        elevation: state.elevation,
        coordinates: state.coordinates,
        time: state.time,
        timeInterval: state.timeInterval,
        running: state.running,
        weight: state.weight
    }
}

export default connect(mapStateToProps)(Run);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
  navigationBar: {
    flex:0.5,
    backgroundColor: '#34495e',
    width: '100%',
    flexDirection: "row"
  },
  navigationButton: {
    flex:1,
    backgroundColor: '#2c3e50',
    margin: 10,
    marginTop: 40,
    borderWidth: 0.5,
    borderColor: '#bdc3c7'
  },
  mapStyle: {
    flex:1.5,
    width: '100%',
  },
  info: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34495e'
  },
  control: {
    flex:1,
    flexDirection: "row"
  },
  stats: {
    flex: 2
  },
  buttonContainer: {
    flex:1,
    backgroundColor: '#2c3e50',
    margin: 10,
    borderWidth: 0.5,
    borderColor: '#bdc3c7'
  },
  buttonText: {
    color: '#bdc3c7',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    padding: 15
  },
  statBox: {
    margin: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statsText: {
    color: '#bdc3c7',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    padding: 10    
  }
});