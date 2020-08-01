import React, {Component} from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import MapView, {Polyline} from 'react-native-maps';
import {toHHMMSS} from '../helpers';

export default class HistoryRuns extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: null,
      token: null,
      runList: [],
      isVisible: false,
      coordinates: []
    };
  }

  componentDidMount() {
    const { userID } = this.props.route.params;
    const { token } = this.props.route.params

    this.setState({userID, token});
    this._fetchRuns(userID, token)
  }

  _fetchRuns = (userID, token) => {
    fetch(`https://locationtrackingapp.herokuapp.com/run/all?userid=${userID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      })
      .then((response) => response.json())
      .then((json) => {
        this.setState({runList: json})
      })
      .catch((error) => {
        // Error handling
      });
  }

  _backToRun = () => {
    this.props.navigation.pop();
  }

  _signOut = () => {
    this.props.navigation.popToTop();
  }

  _showRunMap = (runID) => {
    const createMap = () => {
      for (run of this.state.runList) {
        if (runID == run.id) {
          this.setState({coordinates:run.coordinates, isVisible: true });
        }
      }
    }
    return createMap;
  }

  _getRegion = () => {
    if (this.state.coordinates.length > 1) {
      return {
        latitude: this.state.coordinates[0].latitude,
        longitude: this.state.coordinates[0].longitude,
        latitudeDelta: 0.010,
        longitudeDelta: 0.010,
      };
    } else {
      return {
          latitude: 0,
          longitude: 0,
          latitudeDelta: 0.010,
          longitudeDelta: 0.010,
      };
    }
  }

    render() {
      return (
          <View style={styles.container}>
              <View style={styles.navigationBar}>
                <TouchableOpacity style={styles.navigationButton} onPress={this._signOut}>
                    <Text style={styles.buttonText}>SIGN OUT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navigationButton} onPress={this._backToRun}>
                    <Text style={styles.buttonText}>BACK TO RUN</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.header}>Click the box to show the route!</Text>
            <ScrollView style={styles.scroll}>
            <Modal
              isVisible={this.state.isVisible}
              onBackdropPress={() => this.setState({isVisible: false})}>
              <MapView style={styles.mapStyle} region={this._getRegion()} >
                <Polyline coordinates={this.state.coordinates} strokeWidth={5} />
              </MapView>
            </Modal>
              {this.state.runList.map((item, i) => {
                return (
                  <View key={i}>
                    <TouchableOpacity style={styles.line} onPress={this._showRunMap(item.id)}>
                      <Text style={styles.item}>date: {item.date.split('T')[0]} time: {toHHMMSS(item.time)} distance: {Math.round(item.distance)/1000} (km) calories: {item.calories} (kcal) </Text>
                    </TouchableOpacity>
                  </View>
              )
              })}
            </ScrollView>
          </View>
      );
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#2c3e50',
      paddingTop: 20,
      paddingHorizontal: 20
    },
    header: {
      fontSize: 18,
      alignSelf: 'center',
      padding: 4
    },
    scroll: {
      flex: 0.8
    },
    item: {
      marginTop: 10,
      padding: 15,
      fontSize: 18,
      color: '#bdc3c7'
    },
    idItem: {
      fontSize: 18,
      alignSelf: 'center',
    },
    line: {
      flexDirection: 'row',
      borderColor: '#fff',
      borderWidth: 1,
      marginVertical: 15
    },
    navigationBar: {
      flex:0.2,
      width: Dimensions.get('window').width,
      flexDirection: "row",
      paddingRight: 40
    },
    navigationButton: {
      flex:1,
      backgroundColor: '#2c3e50',
      margin: 10,
      marginTop: 40,
      borderWidth: 0.5,
      borderColor: '#bdc3c7',
    },
    buttonText: {
      color: '#bdc3c7',
      fontSize: 15,
      fontWeight: '700',
      textAlign: 'center',
      padding: 15
    },
    mapStyle: {
      flex:0.5,
      width: Dimensions.get('window').width,
    },
  })