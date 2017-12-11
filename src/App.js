import React, {
  Component
} from 'react';
import './App.css';
import * as xmlsenderutils from './XMLSendingPacket.js';
import $ from 'jquery';
import Modal from './components/Modal';
import styled from 'styled-components';
import ChartDisplay from './ChartDisplay';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LoginErrorHandler from './components/LoginErrorHandler';

var connect_solutions_url = "https://sjccc.connectsolutions.com/start/transaction/actions.do";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
      displayChart: false,
      isLoading: false,
      username: '',
      password: '',
      loginerror: '',
      ccyear: '2017',
      invalidLogin: false
    };
    this.clearSession = this.clearSession.bind(this);
    this.onChange = this.onChange.bind(this);
    //this.displayChart = this.displayChart.bind(this);
  }

  componentWillMount() {
    var today = new Date();
    var year = today.getFullYear();
    this.setState({ ccyear: year })
  }

  componentDidMount() {
    //called after the component has been rendered into the page
    //if a session is detected, then just open the chart
    if (sessionStorage.getItem("sessionKey") !== null) {
      //put the session into the state in order for the usage chart to render the data
      this.setState({ globalsessionkey: sessionStorage.getItem("sessionKey")});
      this.setState({ isModalOpen: false });
      this.setState({ displayChart: true });

    }
  }

  openModal() {
    this.setState({ isModalOpen: true });
  }

  closeModal() {
    this.setState({ isModalOpen: false });
    this.setState({ invalidLogin: false });
  }



  loginClick = () => {
    this.setState({ invalidLogin: false });

    const username = this._username.value;
    const password = this._password.value;
    // console.log("event",event);
    this.setState({ isLoading: true });
    this.Login(
      "update", "session", "logon",
      [
        {name: "username", type: "string", value: username},
        {name: "password", type: "string", value: password}
      ],function(returnValues, returnTypes) {
        sessionStorage.setItem("CSI_username", returnValues['user-name']);
        sessionStorage.setItem("CSI_emailaddress", returnValues['user-logon']);
	    });
  }

  Login(verb,object,type,paramList,successFn) {
    // login to the API

    //these will get populated once the logon call returns successfully, even with a bad login
    var sessionKey = "";
    var transactionStatus = "";
    var loginRequestData = xmlsenderutils.GetJSONDataToSend(sessionKey, verb, object, type, paramList);

    return $.ajax({
      method: "POST",
      crossDomain: false,
      url: connect_solutions_url,
      dataType:"json",
      data: {
          "json-data": JSON.stringify(loginRequestData)
      },
      success: function(data, status, jqxr) {
        //console.log(jqxr.responseText);
        var transactionResponse = JSON.parse(jqxr.responseText);
        var transactionInfo = transactionResponse["transactionInfo"];
        var messageList = transactionResponse["messageList"];

        //set the session in the state
        if (transactionInfo.errorCode !== "OK") {

          for (var i = 0 ; i < messageList.length; ++i) {
           var message = messageList[i];
          var key  = message.key;
          var valueList = message.valueList;
          var value = valueList.value;
          this.setState({ loginerror: "server-side error: "+key +(value?", value: "+JSON.stringify(value):"")});
          }


          this.setState({ invalidLogin: true });

          this.setState({ displayChart: false });
          this.setState({ isModalOpen: true });
          //this is where you would show some kind of hidden div on the modal that tell the user the login credentials were invalid

        } else {
          // login returned successfully, move on with rendering the first page
          var messageList = transactionResponse["messageList"];
          var actionList = transactionResponse["actionList"];
          var actionResponse = actionList[0];
          // set the session key here, so that the subsequent calls are successful
          sessionKey = transactionInfo.sessionKey;

          //session key gets set in session storage
          sessionStorage.setItem("sessionKey", sessionKey)

          this.setState({ displayChart: true });
          this.setState({ isModalOpen: false });
          this.setState({ globalsessionkey: sessionKey });
          //console.log('got the success');

          var retValMap = actionResponse.retvalMap;
          var returnValues = {};
          var returnTypes = {};
          var reportRetvals = {};

          for (var retvalName in retValMap) {
              var o = retValMap[retvalName];
              if (o["retval-type"]==="report-retval") {
                  // report return value
                  //alert("report retval for name "+retvalName +" is:\n\n" + JSON.stringify(o));
                  reportRetvals[retvalName] = o;
              } else {
                  // simple return value
                  returnValues[retvalName]=o.value;
                  returnTypes[retvalName]=o.type;
              }
          }
          successFn(returnValues,returnTypes,reportRetvals);
        }
        this.setState({ isLoading: false });
      }.bind(this)
    });
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  clearSession(e) {
    delete sessionStorage.sessionKey;
    window.location['reload']()
  }

  render() {
    let isLoading = this.state.isLoading;
    const Input = styled.input`
      width: 100%;
      line-height: 47px;
      height: 48px;
      border: 0;
      border-bottom: 1px solid rgba(10, 25, 51, 0.15);
      color: #455a64;
      transition: border 0.5s linear;

      &:hover {
        background: #26b7ff;
        width: 0;
        transition: width 0.3s linear;
        height: 1px;
        bottom: 0;
        left: 0;
        position: absolute;
      }
    `;
    const LoginBtn = styled.button`
        background: #fa0;
        -webkit-border-radius: 25px;
        -moz-border-radius: 25px;
        border-radius: 25px;
        height: 48px;
        min-width: 128px;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        padding: 0 24px;
        overflow: hidden;
        display: inline-block;
        vertical-align: top;
        border: 0;
        margin: 0 0 20px;
        font: 13px/48px 'open_sanssemibold' , arial, helvetica, sans-serif;
        color: #fff !important;
        cursor: pointer;
        -webkit-transition: background .2s ease-in-out;
        -moz-transition: background .2s ease-in-out;
        transition: background .2s ease-in-out;
        text-decoration: none !important;
        text-transform: uppercase;

      &:hover {
        background: #a8cc3d;
        border-color: #a8cc3d;
      }
    `
    const LoginBtnWrapper = styled.div`
      width: 100%;
      overflow: hidden;
      text-align: center;
      clear: both;
      margin: 0;
      padding: 0;
      -webkit-appearance: none;
      box-sizing: border-box;
      border-radius: 0;
      display: block;
    `;
    const LoginBtnWrapper2 = styled.div`
      width: 100%;
      overflow: hidden;
      text-align: center;
      clear: both;
      margin: 0;
      padding: 0;
      -webkit-appearance: none;
      box-sizing: border-box;
      border-radius: 0;
      display: block;
          top: 350px;
          position: absolute;
          float: left;

    `;

    const HeaderBackground = styled.div`
      height: 512px;
      background: url(bg-login@2x.jpg) 50% 0 no-repeat;
      background-size: cover;
    `;
    const Logo = styled.div`
      background: url('logo.png') calc(100% - 68px) center no-repeat #26b7ff;
      background-size: 97px 64px;
      width: 230px;
      height: 96px;
      top: 32px;
      left: -16px;
      position: absolute;
      float: left;
      clear: none;

      &:after {
        content: '';
        width: 16px;
        height: 8px;
        background: url(corner.svg) center no-repeat;
        background-size: 16px 8px;
        position: absolute;
        bottom: 100%;
      }
    `;
    const WelcomeTo = styled.h1`
      color: #fff;
      display: block
      font-family: 'Open Sans','Droid Sans',Tahoma,Arial,sans-serif;


      font-size: 36px;
      line-height: 49px;
      font-weight: normal;
      margin: 0 0 24px 300px;
    `;
    const BlueText = styled.p`
    font-size: 24px;
    line-height: 33px;
    margin: 0 0 48px 300px;
    color: #3bf;
    display: block
    font-family: 'Open Sans','Droid Sans',Tahoma,Arial,sans-serif;

    `;
    const WelcomeTextWrapper = styled.div`
    top: 150px;
          left: -16px;
    position: absolute;
    float: left;
    clear: none;
    `;
    const AppHeader = styled.div`
      background-color: #fff;
      height: 125px;
      padding: 20px;
      color: white;
    `;
    const ContainerDiv1 = styled.div`
      margin-left: auto;
    	margin-right: auto;
      width: 100%;
    `;
    const ContainerDiv = styled.div`
      margin-left: auto;
      margin-right: auto;
      max-width: 1300px;
      padding: 1em;
    `;

    const InvalidLoginDiv = styled.div`
      font-size: 12px;
      color: #F00;
    `;
    const LoginStatusDiv = styled.div`
      height: 20px;
    `;

    if (!this.state.displayChart) {
      return (
        <div>
          <HeaderBackground isOpen={this.state.isModalOpen} >
          <Logo/>
          <WelcomeTextWrapper>
            <WelcomeTo>Welcome to the CoSo Insights</WelcomeTo>
            <BlueText>Real-time data, reporting and administration of your eLearning
              Program on ConnectSolutions Private Managed Cloud</BlueText>
          </WelcomeTextWrapper>
          <LoginBtnWrapper2>
            <LoginBtn onClick={() => this.openModal()}>Login</LoginBtn>
          </LoginBtnWrapper2>
          </HeaderBackground>

          <Modal isOpen={this.state.isModalOpen} onClose={() => this.closeModal()}>
            <input name="username" placeholder="Username" required="" type="text" ref = {input => this._username = input} />
            <br/>
            <input name="password" placeholder="Password" required="" type="password" ref = {input => this._password = input}/>
            <LoginStatusDiv>
                {this.state.invalidLogin ? <LoginErrorHandler message={this.state.loginerror}/> : null}
            </LoginStatusDiv>
            <LoginBtnWrapper>
              <LoginBtn type="submit" disabled={isLoading} onClick={(event) => !isLoading ? this.loginClick() : null}>{isLoading ? 'Processing...' : 'Login'}</LoginBtn>
            </LoginBtnWrapper>
          </Modal>
        </div>
      )
    }
    else {
      return (


<div>

<ContainerDiv1>
<NavBar/>
</ContainerDiv1>
        <ContainerDiv>

<ChartDisplay isOpen={this.state.displayChart}>
  <h1>ChartDisplay</h1>
</ChartDisplay>

<Footer/>

        </ContainerDiv>

</div>
      )
    }
  }
}
export default App;
