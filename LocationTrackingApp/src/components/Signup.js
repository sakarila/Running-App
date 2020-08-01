import React, {Component} from 'react';
import { StyleSheet, Text, ImageBackground, TextInput, TouchableOpacity, KeyboardAvoidingView, Keyboard, Alert} from 'react-native';

export default class Signup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            weight: ''
        };
      };

    _createUser = () => {
        if(this._checkTextInput()) {
            fetch('https://locationtrackingapp.herokuapp.com/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.state.username,
                    password: this.state.password,
                    weight: parseInt(this.state.weight)
                }),
            })
            .then((response) => response.json())
            .then((json) => {
                Keyboard.dismiss();
                if(json.status) {
                    Alert.alert("", json.message);
                    this.setState({username: '', password: '', weight: ''});
                    this.props.navigation.navigate('Login')
                } else {
                    Alert.alert("Error", json.message);
                    this.setState({username: '', password: '', weight: ''});
                }
            })
            .catch((err) => {
                // TODO: handle error
            })
        }
    }

    _checkTextInput = () => {
        if(this.state.username == '' || this.state.password == '' || this.state.weight == '' || isNaN(parseInt(this.state.weight))) {
            Alert.alert("Error", "Something went wrong. Please check your input fields!")
            return false;
        } else {
            return true;
        }
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

                    <TextInput style={styles.input} placeholder="Weight (kg)" keyboardType={'numeric'}
                    onChangeText={(text) => this.setState({weight: text})} value={this.state.weight} />

                    <TouchableOpacity style={styles.buttonSignUp} onPress={this._createUser}>
                        <Text style={styles.buttonText}>SIGN UP!</Text>
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
      justifyContent: 'center',
      paddingHorizontal: 40
    },
    input: {
      backgroundColor: '#34495e',
      height: 50,
      marginBottom: 20,
      padding: 10
    },
    buttonSignUp: {
      backgroundColor: '#2c3e50',
      padding: 15,
    },
    buttonText: {
      color: '#bdc3c7',
      fontSize: 15,
      fontWeight: '700',
      textAlign: 'center'
    }
  });