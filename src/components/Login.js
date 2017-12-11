import React, {Component} from 'react';

class Login extends Component{
  constructor(props){
    super(props);
    this.state = {

    }
  }

  static defaultProps = {
    sessionId:''
  }

  render(){
    return(
      <div className="login">
      <h2>Session ID:
      {this.props.sessionId}</h2>

      </div>
          )
      }
}

export default Login;
