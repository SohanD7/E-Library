import React, { Component } from "react";
import { Rajdhani_600SemiBold } from "@expo-google-fonts/rajdhani";
import * as Font from "expo-font";

import BottomTabNavigator from "./components/BottomTabNavigator";
import LoginScreen from "./screens/LoginScreen";

import { LogBox } from "react-native";
//import {createAppContainer, createSwitchNavigator} from "react-navigation";

LogBox.ignoreAllLogs();


export default class App extends Component {
  constructor() {
    super();
    this.state = {
      fontLoaded: false
    };
  }

  async loadFonts() {
    await Font.loadAsync({
      Rajdhani_600SemiBold: Rajdhani_600SemiBold
    });
    this.setState({ fontLoaded: true });
  }

  componentDidMount() {
    this.loadFonts();
  }

  render() {
    const { fontLoaded } = this.state;
    if (fontLoaded) {
      return <BottomTabNavigator/>;
    }
    return null;
  }
}

/*const AppNavigator = createSwitchNavigator({
  Login: {screen: LoginScreen},
  BottomTab: {screen: BottomTabNavigator}
},
{initialRouteName: "Login"}
);
const AppContainer = createAppContainer(AppNavigator);*/
