import React, {Component} from 'react';
import Signup from './src/components/Signup';
import Login from './src/components/Login';
import HistoryRuns from './src/components/HistoryRuns';
import Run from './src/components/Run';
import store from './src/store';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Provider} from 'react-redux';

const Stack = createStackNavigator();

export default class App extends Component {

  render() {
    return (
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }} >
            <Stack.Screen name='Signup' component={Signup} />
            <Stack.Screen name='Login' component={Login} />
            <Stack.Screen name='HistoryRuns' component={HistoryRuns} />
            <Stack.Screen name='Run' component={Run} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    )
  }
}