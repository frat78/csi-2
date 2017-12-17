import React, {
  Component
} from 'react';
import styled from 'styled-components';

class SessionExpiration extends Component{
  constructor(props){
    super(props);
  }

  render(){

    const RedirectionDiv = styled.div`
      margin-top: 50px;
    	border-top: 1px solid #eee;
    	padding: 20px 0;
    	font-size: 12px;
    	color: #999;
    `;

    var timer = setTimeout(function() {
            window.location='/'
        }, 3000);


    return(
      <RedirectionDiv>Your session has expired.  You are being redirected to the login screen.</RedirectionDiv>
          )
      }
}

export default SessionExpiration;
