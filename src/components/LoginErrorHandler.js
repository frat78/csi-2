import React, {Component} from 'react';
import styled from 'styled-components';

const InvalidLoginDiv = styled.div`
  font-size: 12px;
  color: #F00;
`;

class LoginErrorHandler extends Component{

  static defaultProps = {
    sessionId:''
  }

  render(){
    return (
        <InvalidLoginDiv>
            {this.props.message}
        </InvalidLoginDiv>
    );
      }
}

export default LoginErrorHandler;
