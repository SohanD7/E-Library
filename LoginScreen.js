import React, {Component} from 'react';
import {StyleSheet, View, Text, TextInput, TouchableOpacity, Image} from 'react-native';
import { ImageBackground } from 'react-native-web';
const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");
import firebase from "firebase";
 
export default class LoginScreen extends Component
{
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
  }
  
  handleLogin=(email,password)=>
  {
    firebase.auth()
    .signInWithEmailAndPassword(email,password)
    .then(()=>{this.props.navigation.navigate("BottomTab")})
    .catch((error)=>{alert(error.message)})
  }
  
  render()
  {
    const {email,password} = this.state; 
    return(
      <View style={styles.container}>
        <ImageBackground source={bgImage} style={styles.bgImage}>
        <View style={styles.upperContainer}>
            <Image source={appIcon} style={styles.appIcon} />
            <Image source={appName} style={styles.appName} />
          </View>
        <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              onChangeText={(text) => {
                this.setState({ email: text });
              }}
              placeholder={'Enter Username'}
              autoFocus
            />
            <TextInput
              style={styles.textInput}
              onChangeText={(text) => {
                this.setState({ password: text });
              }}
              placeholder={'Enter Password'}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={()=>{this.handleLogin(email,password)}}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
        </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5653D4"
  },

  upperContainer: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center"
  },

  textInputContainer: {
    alignItems: "center"
  },

  textInput: {
    width: "40%",
    height: 50,
    padding: 10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF",
    marginTop: 20
  },

  appIcon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 80
  },

  bgImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },

  appName: {
    width: 80,
    height: 80,
    resizeMode: "contain"
  },
  button: {
    width: 120,
    height: 60,
    marginTop: 20,
    backgroundColor: '#F48D20',
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20
  },
  buttonText: {
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF",
    fontSize: 18
  }
})