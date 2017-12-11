import React, {
  Component
} from 'react';

import styled from 'styled-components';
import * as xmlsenderutils from '../XMLSendingPacket.js';
import $ from 'jquery';
import { Redirect } from 'react-router';
import NavBar from './NavBar';
import Footer from './Footer';
import Refresh from './Refresh';
import Meetings from './Meetings';

class MeetingsContainer extends Component{
  constructor(props){
    super(props);

    this.state = {
      redirect: false,
      meetings: []
    };
  }

  componentWillMount() {
    //this page cannot be shown if the session is non existent
    if (sessionStorage.getItem("sessionKey") == 'undefined' || sessionStorage.getItem("sessionKey") == null)
    {
      this.setState({ redirect: true })
    }

  }


  GetMeetings(sessionKey) {
    return $.ajax({
      method: "POST",
      crossDomain: false,
      url: "https://sjccc.connectsolutions.com/start/transaction/actions.do",
      dataType:"json",
      data: {"json-data": JSON.stringify(xmlsenderutils.GetJSONDataToSend(sessionKey, 'query', 'reseller', 'get-reseller-installation-report', []))},
      success: function(data, status, jqxr) {
          var result = [];
          var transactionResponse = JSON.parse(jqxr.responseText);
          var transactionInfo = transactionResponse["transactionInfo"];
          var actionList = transactionResponse["actionList"];

          if (transactionInfo.errorCode === "OK" &&
              typeof actionList !== 'undefined' &&
              actionList.length > 0 &&
              actionList[0].actionStatus === "ok") {
            var retvalMap = actionList[0].retvalMap;
            if (typeof retvalMap !== 'undefined') {
              var installationReport = retvalMap["installation-report"];
              const idIndex = 0;
              const accountNameIndex = 3;
              const installationKeyIndex = 4;
              const meetingsCountIndex = 12;
              const usersCountIndex = 13;

              result = installationReport.rows.map((account, index, accounts) => {
                  return {
                    id:account[idIndex],
                    installation_key:account[installationKeyIndex],
                    account_name:account[accountNameIndex],
                    meetings_count:account[meetingsCountIndex],
                    users_count:account[usersCountIndex]
                  }
              });
            }
          }

          this.setState({meetings: result});
        }.bind(this)}
      );
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.intervalElapsed !== nextState.intervalElapsed) {
      this.GetMeetings(sessionStorage.getItem("sessionKey"));
      return false;
    }
    return true;
  }

  render() {
    //redirect to the entry point if the state says so
    const { redirect } = this.state;
         if (redirect) {
           return <Redirect to='/'/>;
         }

    const ContainerDiv = styled.div`
      margin: 0 auto;
    	max-width: 975px;
    `;

    const ContainerDiv1 = styled.div`
      margin-left: auto;
    	margin-right: auto;
    `;

    return (
      <div>
      <ContainerDiv1>
      <NavBar/>
      </ContainerDiv1>
      <ContainerDiv>
        <h1>Test</h1>
        <Refresh seconds={5}>
          <Meetings />
        </Refresh>
        <Footer />
      </ContainerDiv>
      </div>
    )
  }
}

export default MeetingsContainer;
