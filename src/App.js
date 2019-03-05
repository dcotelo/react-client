import React, { Component } from 'react';
import { Loading } from './components/common/';
import Auth from './screens/Auth';
import LoggedIn from './screens/LoggedIn';
import deviceStorage from './services/deviceStorage.js';

import { AsyncStorage } from 'react-native';
import firebase from 'react-native-firebase';
import axios from 'axios';

import {ToastAndroid} from 'react-native';

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      jwt: '',
      loading: true
    }

    this.newJWT = this.newJWT.bind(this);
    this.deleteJWT = deviceStorage.deleteJWT.bind(this);
    this.loadJWT = deviceStorage.loadJWT.bind(this);
    this.loadJWT();
  }

  newJWT(jwt){
    this.setState({
      jwt: jwt
    });
  }
//push token
async componentDidMount() {
  this.checkPermission();
  this.createNotificationListeners(); //add this line
}


componentWillUnmount() {
  this.notificationListener();
  this.notificationOpenedListener();
}


async createNotificationListeners() {
  /*
  * Triggered when a particular notification has been received in foreground
  * */
  this.notificationListener = firebase.notifications().onNotification((notification) => {
      const { title, body } = notification;
      this.showAlert(title, body);
  });

  /*
  * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
  * */
  this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      const { title, body } = notificationOpen.notification;
      this.showAlert(title, body);
  });

  /*
  * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
  * */
  const notificationOpen = await firebase.notifications().getInitialNotification();
  if (notificationOpen) {
      const { title, body, payload } = notificationOpen.notification.data;
      this.showAlert(title, body);
  }
  /*
  * Triggered for data only payload in foreground
  * */
  this.messageListener = firebase.messaging().onMessage((message) => {
    //process data message
    console.log(JSON.stringify(message));
  });
}
showAlert(title, body) {
  ToastAndroid.show(title + ' ' + body, ToastAndroid.SHORT);
  /*
  ToastAndroid.showWithGravity(
    'All Your Base Are Belong To Us',
    ToastAndroid.SHORT,
    ToastAndroid.CENTER,
  );
  ToastAndroid.showWithGravityAndOffset(
    'A wild toast appeared!',
    ToastAndroid.LONG,
    ToastAndroid.BOTTOM,
    25,
    50,
  );
  */
}

 //1
 async checkPermission() {
  const enabled = await firebase.messaging().hasPermission();
  if (enabled) {
      this.getToken();
  } else {
      this.requestPermission();
  }
}

  //3
async getToken() {
  let fcmToken = await AsyncStorage.getItem('fcmToken');
  if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
          // user has a device token
          await AsyncStorage.setItem('fcmToken', fcmToken);
          
      }
  }else{
    let value = await AsyncStorage.getItem('id_token');
    if (value != null){
       // do something 
       const headers = {
        'Authorization': 'Bearer ' + value
      };
      axios.post("http://demo.iolabs.uy/api/fcm",{
        fcm: fcmToken,
        jwt: value
    },{headers: headers})
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
      console.log(value);
      console.log(fcmToken);
    });
    }
    
   
 
  }
}

  //2
async requestPermission() {
  try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
  } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
  }
}

//end token
  render() {
    if (this.state.loading) {
      return (
        <Loading size={'large'} />
       );
    } else if (!this.state.jwt) {
      return (
        <Auth newJWT={this.newJWT} />
      );
    } else if (this.state.jwt) {
      return (
        <LoggedIn jwt={this.state.jwt} deleteJWT={this.deleteJWT} />
      );
    }
  }
}