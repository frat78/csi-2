import React, {
  Component
} from 'react';
import styled from 'styled-components';
import { Redirect } from 'react-router';

class SessionExpiration extends Component{
  constructor(props){
    super(props);
    this.state = {
      redirect: false
    };
  }

  render(){

    const { redirect } = this.state;
    if (redirect) {
      //blow away the expired session
      delete sessionStorage.sessionKey;
      delete sessionStorage.CSI_username;
      //then redirect to the login page
      return <Redirect to='/'/>;
    }

    const RedirectionDiv = styled.div`
      margin-top: 50px;
    	border-top: 1px solid #eee;
    	padding: 20px 0;
    	font-size: 22px;
    	color: #000;
    `;

    var timer = setTimeout(function() {
            this.setState({ redirect: true })
        }, 3000);


    return(
      <RedirectionDiv>Your session has expired.  You are being redirected to the login screen.</RedirectionDiv>
          )
      }
}

export default SessionExpiration;
