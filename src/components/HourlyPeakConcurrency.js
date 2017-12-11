import React, {
  Component
} from 'react';
import styled from 'styled-components';
import * as xmlsenderutils from '../XMLSendingPacket.js';
import * as dataParserUtils from '../ParseData.js';
import $ from 'jquery';
import {Link} from 'react-router-dom';
import { Redirect } from 'react-router';
import NavBar from './NavBar';
import Footer from './Footer';
import download from 'downloadjs';
import { Button, ButtonGroup, DropdownButton, MenuItem, ButtonToolbar, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import Loadable from 'react-loading-overlay';

var connect_solutions_url = "https://sjccc.connectsolutions.com/start/transaction/actions.do";

class HourlyPeakConcurrency extends Component{
  constructor(props){
    super(props);
    this.state = {
      selectedInstallationId: "SAP",
      loading: false,
      redirect: false
    };
    this.changeInstallation = this.changeInstallation.bind(this);
  }

  componentWillMount() {
    //this page cannot be shown if the session is non existent
    if (sessionStorage.getItem("sessionKey") == 'undefined' || sessionStorage.getItem("sessionKey") == null)
    {
      this.setState({ redirect: true })
    }
    else
     {
       //grab a list of all connect installations (backbone for this component)
       this.GetConnectInstallations(sessionStorage.getItem("sessionKey"));

     }
  }

  componentDidMount() {
    //called after the component has been rendered into the page
  }

  changeInstallation(eventKey){
    var installationArray = [];
    this.setState({
      //turn on the loading icon
      loading: true,
      selectedInstallationId: eventKey
    });

    //stick the value in an array of 1, because that's how the HourlyPeakConcurrency method expects it
    installationArray.push({value:eventKey});

    //recall the hourly peak concurrency data for the chart
    this.GetHourlyPeakConcurrency(sessionStorage.getItem("sessionKey"),installationArray);
  }

  UpdateInstallationSelections(transactionResponse) {
    var installation_array = dataParserUtils.processInstallationsJSONResult(transactionResponse);
    this.setState({
        installations: installation_array,
        selectedInstallationId: ((installation_array.length > 0) ? installation_array[0].value : undefined)
    });

    //throw all the available installation values into an array
    var installationParamsArray = [];
    for (var i = 0; i < this.state.installations.length; i++) {
      installationParamsArray.push({value:this.state.installations[i].value});
    }
    //installation locations defined, now we can call the hourly concurrency data, passing the newly created array
    this.GetHourlyPeakConcurrency(sessionStorage.getItem("sessionKey"),installationParamsArray);
  }

  GetConnectInstallations(sessionKey) {
    //Get Connect Installations Listing, using session ID from session storage
    var GetConnectInstallationsRequestData = xmlsenderutils.GetJSONDataToSend(sessionKey, 'query', 'reseller', 'get-reseller-installation-report', []);

    return $.ajax({
      method: "POST",
      crossDomain: false,
      url: connect_solutions_url,
      dataType:"json",
      data: {"json-data": JSON.stringify(GetConnectInstallationsRequestData)},
      success: function(data, status, jqxr) {
        //console.log(jqxr.responseText);
        var transactionResponse = JSON.parse(jqxr.responseText);
        var transactionInfo = transactionResponse["transactionInfo"];
        var messageList = transactionResponse["messageList"];
        var actionList = transactionResponse["actionList"];
        var actionResponse = actionList[0];

        if (transactionInfo.errorCode !== "OK")
        {
          alert(transactionInfo.errorCode);
        }
        else
        {
          var retValMap = actionResponse.retvalMap;
          var returnValues = {};
          var returnTypes = {};
          var reportRetvals = {};

          for (var retvalName in retValMap) {
              var o = retValMap[retvalName];
              if (o["retval-type"]=="report-retval") {
                  // report return value
                  //alert("report retval for name "+retvalName +" is:\n\n" + JSON.stringify(o));
                  reportRetvals[retvalName] = o;
              } else {
                  // simple return value
                  returnValues[retvalName]=o.value;
                  returnTypes[retvalName]=o.type;
              }
          }
          console.log(retValMap);
          this.UpdateInstallationSelections(JSON.parse(jqxr.responseText));
        }

      }.bind(this)}
    );
  }

  GetHourlyPeakConcurrency(sessionKey,installationParamsArray) {
    var connectIDarray = [];
    for (var i = 0; i < installationParamsArray.length; i++) {
      connectIDarray.push({name: "connect-installation-id", type: "id", value: installationParamsArray[i].value},);
    }
    //console.log(connectIDarray);
    //Get Hourly Peak Concurrency data, using session ID from session storage
    var GetHourlyPeakConcurrencyRequestData = xmlsenderutils.GetJSONDataToSend(sessionKey, 'query', 'connect', 'get-week-over-week-hourly-metrics-report',connectIDarray);

    return $.ajax({
      method: "POST",
      crossDomain: false,
      url: connect_solutions_url,
      dataType:"json",
      data: {"json-data": JSON.stringify(GetHourlyPeakConcurrencyRequestData)},
      success: function(data, status, jqxr) {
        console.log(jqxr.responseText);
        var transactionResponse = JSON.parse(jqxr.responseText);
        var transactionInfo = transactionResponse["transactionInfo"];
        var messageList = transactionResponse["messageList"];
        var actionList = transactionResponse["actionList"];
        var actionResponse = actionList[0];

        if (transactionInfo.errorCode !== "OK")
        {
          alert(transactionInfo.errorCode);
        }
        else
        {
          var retValMap = actionResponse.retvalMap;
          var returnValues = {};
          var returnTypes = {};
          var reportRetvals = {};

          for (var retvalName in retValMap) {
              var o = retValMap[retvalName];
              if (o["retval-type"]=="report-retval") {
                  // report return value
                  //alert("report retval for name "+retvalName +" is:\n\n" + JSON.stringify(o));
                  reportRetvals[retvalName] = o;
              } else {
                  // simple return value
                  returnValues[retvalName]=o.value;
                  returnTypes[retvalName]=o.type;
              }
          }
          console.log(retValMap);

          //this is where the chart state should get updated

          this.setState({
            //turn off the loading icon
            loading: false,
          });
        }

      }.bind(this)}
    );
  }

  render(){
    //redirect to the entry point if the state says so
    const { redirect } = this.state;
         if (redirect) {
           return <Redirect to='/'/>;
         }

         const { loading } = this.state;

    const ContainerDiv = styled.div`
      margin-left: auto;
    	margin-right: auto;
    	max-width: 975px;
    	padding: 1em;
    `;

    const ContainerDiv1 = styled.div`
      margin-left: auto;
    	margin-right: auto;
    `;

    if (this.state.installations) {
      //installation list
      var installationsElements1 = [];
      for (var i = 0; i < this.state.installations.length; i++) {
        installationsElements1.push(<MenuItem eventKey={this.state.installations[i].value} selected={true} onSelect={this.changeInstallation}>{this.state.installations[i].display}</MenuItem>);
      }
    }

    return(
      <div className="App">
      <ContainerDiv1>
      <NavBar/>
      </ContainerDiv1>
      <ContainerDiv>
  
<Loadable active ={ loading } spinner text='Calculating the data'>
<div id="myChart" height="600" width="800">

  <ButtonGroup>
    <DropdownButton title="Connect Installation" id="bg-nested-dropdown3">
      {installationsElements1}
    </DropdownButton>
  </ButtonGroup>

</div>
</Loadable>
<Footer/>
    </ContainerDiv>

</div>
  )
      }
}

export default HourlyPeakConcurrency;
