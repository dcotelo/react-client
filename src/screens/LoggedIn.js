import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { Button, Loading } from '../components/common/';
import axios from 'axios';

export default class LoggedIn extends Component {
  constructor(props){
    super(props);
    this.state = {
      loading: true,
      email: '',
      name: '',
      error: ''
    }
  }

  componentDidMount(){
    const headers = {
      'Authorization': 'Bearer ' + this.props.jwt
    };
    axios({
      method: 'POST',
      url: 'http://demo.iolabs.uy/api/details',
      headers: headers,
    }).
    
    then((response) => {
      this.setState({
        email: response.data.success.email,
        name :response.data.success.name,
        loading: false
      });
    }).catch((error) => {
      this.setState({
        error: 'Error retrieving data',
        loading: false
      });
    });
  }

  render() {
    const { container, emailText, errorText } = styles;
    const { loading, name, email, error } = this.state;

    if (loading){
      return(
        <View style={container}>
          <Loading size={'large'} />
        </View>
      )
    } else {
        return(
          <View style={container}>
            <View>
              {email ?
                <Text style={emailText}>
                  Your email: {email}
                </Text>
                :
                <Text style={errorText}>
                  {error}
                </Text>}
                {email ?
                <Text style={emailText}>
                  Your Name: {name}
                </Text>
                :
                <Text style={errorText}>
                  {error}
                </Text>}
            </View>
            <Button onPress={this.props.deleteJWT}>
              Log Out
            </Button>
          </View>
      );
    }
  }
}

const styles = {
    form: {
 
        backgroundColor: '#fff',
      },
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  emailText: {
    alignSelf: 'center',
    color: 'black',
    fontSize: 20
  },
  errorText: {
    alignSelf: 'center',
    fontSize: 18,
    color: 'red'
  }
};