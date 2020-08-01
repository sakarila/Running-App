import React, {Component} from 'react';
import { StyleSheet, Text, ImageBackground, TextInput, TouchableOpacity, KeyboardAvoidingView, Keyboard, Alert} from 'react-native';

export default class Login extends Component {
    constructor(props) {
      super(props);
      this.state = {
        username: '',
        password: ''
      };
    }
  
    _signup = () => {
      this.props.navigation.navigate('Signup')
    }

    _logging = () => {
        fetch('https://locationtrackingapp.herokuapp.com/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.state.username,
            password: this.state.password
          }),
        })
        .then((response) => response.json())
        .then((json) => {
          Keyboard.dismiss();
          if(json.auth) {
            this.setState({username:'', password:''});
            this.props.navigation.navigate('Run', {userID: json.id, token: json.token, weight: json.weight});
          } else {
            Alert.alert("Error", json.message);
          }
        })
        .catch((error) => {
          // Error handling
        });
    };
  
    render() {
     const backgroundPicPath = 'C:/Users/35850/Documents/RunningApp/LocationTrackingApp/src/images/RunningApp-LoginPicture.jpg'

      return (
          <ImageBackground source={require(backgroundPicPath)} style={styles.picture}>
            <KeyboardAvoidingView style={styles.container}>
              <TextInput style={styles.input} placeholder="Username" autoCapitalize='none'
              onChangeText={(text) => this.setState({username: text})} value={this.state.username} />

              <TextInput style={styles.input} placeholder="Password" secureTextEntry autoCapitalize='none'
              onChangeText={(text) => this.setState({password: text})} value={this.state.password} />
              <TouchableOpacity style={styles.button} onPress={this._logging}>
                <Text style={styles.buttonText}>LOGIN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={this._signup}>
                  <Text style={styles.buttonText}>SIGN UP</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </ImageBackground>
      );
    }
  }

  const styles = StyleSheet.create({
    picture: {
      flex: 1,
      width: '100%',
    },
    container: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: 40,
    },
    signInButton: {
      backgroundColor: '#2c3e50',
    },
    input: {
      backgroundColor: '#34495e',
      height: 50,
      marginBottom: 20,
      padding: 10
    },
    button: {
      backgroundColor: '#2c3e50',
      padding: 15,
      marginBottom:20
    },
    buttonText: {
      color: '#bdc3c7',
      fontSize: 15,
      fontWeight: '700',
      textAlign: 'center'
    }
  });
  