import React, { Component } from 'react';
import './App.css';
import * as xmlsenderutils from './XMLSendingPacket.js';
import * as dataParserUtils from './ParseData.js';
import Loading from './components/Loading';
import Loadable from 'react-loading-overlay';
import $ from 'jquery';
import Usage from './components/Usage';
import download from 'downloadjs';
import { Button, ButtonGroup, DropdownButton, MenuItem, ButtonToolbar, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { Redirect } from 'react-router';

var connect_solutions_url = "https://sjccc.connectsolutions.com/start/transaction/actions.do";
var allTimeValue = 900;

class ChartDisplay extends Component {
  constructor(props){
    super(props);
    this.state =  {
                    radios:
                    [
                      { labelId: "rptPrd1Day", value: 1, display: "1 day"},
                      { labelId: "rptPrd6Weeks", value: 42, display: "6 weeks"},
                      { labelId: "rptPrdAllTime", value: allTimeValue, display: "All Time"}
                    ],
                    selectedReportPeriodDays: allTimeValue,
                    selectedReportPeriod: "All Time",
                    selectedGroup: "SAP",
                    selectedGroupId: "SAP",
                    loading: false,
                    redirect: false
                  };
    this.changeGroup = this.changeGroup.bind(this);
    this.changePeriod = this.changePeriod.bind(this);
  }

  componentWillMount() {
    //at first, this prop is undefined, so just need to check for the value
    // if (typeof this.props.globalsessionkey != 'undefined')
    // {
    //   this.setState({
    //     globalsessionkey: this.props.globalsessionkey
    //   });
    //   this.UpdateGlmList(this.props.globalsessionkey);
    // }

    if (sessionStorage.getItem("sessionKey") == 'undefined' || sessionStorage.getItem("sessionKey") == null)
    {
      this.setState({ redirect: true })
    }
// else
// {
//   this.UpdateGlmList(sessionStorage.getItem("sessionKey"));
//
// }

  }

  componentDidMount() {
    //called after the component has been rendered into the page
  }

  changeGroup(eventKey){
    this.setState({
      //turn on the loading icon
      loading: true,
      selectedGroupId: eventKey
    });
    this.UpdateGLMQuotas(sessionStorage.getItem("sessionKey"), Number(eventKey), this.state.selectedReportPeriodDays)
  }

  changePeriod(eventKey){
    this.setState({
      //turn on the loading icon
      loading: true,
      selectedReportPeriod: eventKey
    });
    var timechunk;
    if (eventKey=="1 day") timechunk = '1';
    else if (eventKey=="6 weeks") timechunk = '42';
    else timechunk = '900'
    this.UpdateGLMQuotas(sessionStorage.getItem("sessionKey"), this.state.selectedGroupId, Number(timechunk))
  }

  includeLimit() {
    try {
      this.setState({
        //turn on the loading icon
        loading: true
      });
      this.UpdateGLMQuotas(sessionStorage.getItem("sessionKey"), this.state.selectedGroupId, this.state.selectedReportPeriodDays)
    } catch (e) { console.log(e) }
  }

  downloadChartImage(that){
    try {
      var today = new Date();
      var fileName = that + "_" + (today.getMonth() + 1) + "-" + today.getDate() + "-" + today.getFullYear() + "_" + today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
      download(document.getElementById("myChart").children[1].children[1].toDataURL(), fileName + ".png", "image/png")
    } catch (e) { console.log(e) }
  }

  downloadPDFImage(that){
    try {
      var today = new Date();
      var fileName = that + "_" + (today.getMonth() + 1) + "-" + today.getDate() + "-" + today.getFullYear() + "_" + today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
      download(document.getElementById("myChart").children[1].children[1].toDataURL(), fileName + ".pdf", "application/pdf")
    } catch (e) { console.log(e) }
  }

  UpdateAppState(transactionResponse, selectedGroupId, selectedReportPeriodDays) {
    var data_array = dataParserUtils.processGLMQuotaJSONResult(transactionResponse, true);
    var label_array = [];
    if (data_array.length > 0) {
      for (var y = 0; y < data_array[0].data.length; y++) {
          if (typeof(data_array[0].data[y]) !== undefined) {
              label_array.push(data_array[0].data[y].labelTime);
          }
      }
    }
    this.setState({
      selectedGroupId: selectedGroupId,
      selectedReportPeriodDays: selectedReportPeriodDays,
      chartData: {labels: label_array, datasets: data_array},
      //turn off loading icon
      loading: false
      })
  }

  UpdateGroupSelections(transactionResponse) {
    var option_array = dataParserUtils.processGlmGroupsJSONResult(transactionResponse);
    this.setState({
        options: option_array,
        selectedGroupId: ((option_array.length > 0) ? option_array[0].value : undefined)
    });
  }

  UpdateGlmList(sessionKey) {
    //Get GLM Listing, using session ID returned from previous login call
    var glmQuotaListRequestData = xmlsenderutils.GetJSONDataToSend(sessionKey, 'query', 'reseller', 'list-reseller-glm-groups', []);

    return $.ajax({
      method: "POST",
      crossDomain: false,
      url: connect_solutions_url,
      dataType:"json",
      data: {"json-data": JSON.stringify(glmQuotaListRequestData)},
      success: function(data, status, jqxr) {
        //console.log(jqxr.responseText);
        var transactionResponse = JSON.parse(jqxr.responseText);
        var transactionInfo = transactionResponse["transactionInfo"];
        var messageList = transactionResponse["messageList"];

        if (transactionInfo.errorCode !== "OK")
        {
          for (var i = 0 ; i < messageList.length; ++i) {
           var message = messageList[i];
          var key  = message.key;
          var valueList = message.valueList;
          var value = valueList.value;
          alert("Error: "+key +(value?", value: "+JSON.stringify(value):""));
          }
          //alert(transactionInfo.errorCode);
        }
        else
        {
          this.UpdateGroupSelections(JSON.parse(jqxr.responseText));
        }

      }.bind(this)}
    );
  }

  UpdateGLMQuotas(sessionKey, selectedGroupId, selectedReportPeriodDays) {
      //get the quota report
      var endTime = new Date().getTime();
      var startTime = endTime - (selectedReportPeriodDays * 24 * 60 * 60 * 1000)

      var glmQuotaReportRequestData = xmlsenderutils.GetJSONDataToSend(sessionKey, 'query', 'reseller', 'get-glm-quota-report',
        [
          {name: "group-id", type: "id", value: selectedGroupId},
          {name: "quota-id", type: "long", value: 12}, // 12 is meeting users
          {name: "object", type: "string", value: "account"},
          {name: "start-time", type: "long", value: startTime},
          {name: "end-time", type: "long", value: endTime}
        ]);

      return $.ajax({
          method: "POST",
          crossDomain: false,
          url: connect_solutions_url,
          dataType:"json",
          data: {"json-data": JSON.stringify(glmQuotaReportRequestData)},
          success: function(data, status, jqxr) {
              //console.log(jqxr.responseText);
              this.UpdateAppState(JSON.parse(jqxr.responseText), selectedGroupId, selectedReportPeriodDays);
          }.bind(this)}
      );
  }

  render() {
    //if there is no session, redirect to the entry point (login)
    const { redirect } = this.state;
         if (redirect) {
           return <Redirect to='/'/>;
         }

    const { loading } = this.state;

    if (sessionStorage.getItem("sessionKey")) {
      var radioElements = [];
      var dropElements = [];

      //radios (legacy)
      for (var i = 0; i < this.state.radios.length; i++) {
        var isChecked = this.state.radios[i].value === this.state.selectedReportPeriodDays;
        radioElements.push(<input type="radio" name="reportPeriod" id={this.state.radios[i].labelId}
          value={this.state.radios[i].value} onClick={this.changePeriod} checked={isChecked} />);
        radioElements.push(<label htmlFor={this.state.radios[i].labelId}> {this.state.radios[i].display} </label>);
      }

      //time period drop down
      for (var i = 0; i < this.state.radios.length; i++) {
        var isChecked = this.state.radios[i].value === this.state.selectedReportPeriodDays;
        dropElements.push(<MenuItem eventKey={this.state.radios[i].display} onSelect={this.changePeriod} selected={isChecked}>{this.state.radios[i].display}</MenuItem>);
      }

      if (this.state.options) {
        //report group, like SAP
        var optionsElements = [];
        for (i = 0; i < this.state.options.length; i++) {
          optionsElements.push(<option value={this.state.options[i].value}>{this.state.options[i].display}</option>);
        }

        //report group, like SAP
        var optionsElements1 = [];
        for (i = 0; i < this.state.options.length; i++) {
          optionsElements1.push(<MenuItem eventKey={this.state.options[i].value} selected={true} onSelect={this.changeGroup}>{this.state.options[i].display}</MenuItem>);
        }
        //optionsElements.push(<option value="2">Dummy</option>);

        if (this.state.chartData) {

          return (
            <div className="App">

              <Loadable active ={ loading } spinner text='Calculating the data'>
              <div id="myChart" height="600" width="800">

              <ButtonGroup>

                <DropdownButton title="Report Group" id="bg-nested-dropdown3">
                  {optionsElements1}
                </DropdownButton>
                <DropdownButton title="Reporting Period" id="bg-nested-dropdown2">
                  {dropElements}
                </DropdownButton>
                <DropdownButton title="Export Chart" id="bg-nested-dropdown">
                  <MenuItem eventKey={this.state.selectedGroup} onSelect={this.downloadChartImage}>Save as Image</MenuItem>
                </DropdownButton>
              </ButtonGroup>

              <Usage chartData={this.state.chartData} legendPosition="bottom" selectedGroup={this.state.selectedGroup} timePeriod={this.state.selectedReportPeriod}/>

              </div>

              </Loadable>

            </div>
          );
        }
        else {
          this.UpdateGLMQuotas(sessionStorage.getItem("sessionKey"), this.state.selectedGroupId, allTimeValue);
        }
      }
      else {
        this.UpdateGlmList(sessionStorage.getItem("sessionKey"));
      }
    }

    return (
      <div className="App">
        <Loading/>
      </div>
    );
  }

}

export default ChartDisplay;
