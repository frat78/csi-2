import React, {
  Component
} from 'react';

import styled from 'styled-components';
import $ from 'jquery';
import * as xmlsenderutils from '../XMLSendingPacket.js';
import * as dataParserUtils from '../ParseData.js';
import { Redirect } from 'react-router';
import NavBar from './NavBar';
import Footer from './Footer';
import download from 'downloadjs';
import Chart from './Chart';
import PieChart from './PieChart';
import Loading from './Loading';
import Loadable from 'react-loading-overlay';
import moment from 'moment';
import { ButtonGroup, Button } from 'react-bootstrap';

var connect_solutions_url = "https://sjccc.connectsolutions.com/start/transaction/actions.do";
var allTimeValue = 900;
var reportType = "meetings";

class Overview extends Component{
  constructor(props){
    super(props);
    this.state = {
      ccyear: '2017',
      loading: false,
      redirect: false,
      meetingsbtnstatus: true,
      usersbtnstatus: false,
      contentbtnstatus: false
    };
  }

  componentWillMount() {
    //this page cannot be shown if the session is non existent
    if (sessionStorage.getItem("sessionKey") === 'undefined' || sessionStorage.getItem("sessionKey") === null)
    {
      this.setState({ redirect: true })
    }
    else { //let's get some data
      this.setState({ loading: true });
      this.UpdatePieCharts(sessionStorage.getItem("sessionKey"));
    }
  }

  componentDidMount() {
    //called after the component has been rendered into the page
  }

  UpdatePieCharts(sessionKey) {
    var ReportRequestData = xmlsenderutils.GetJSONDataToSend(sessionKey, 'query', 'reseller', 'get-reseller-installation-report'); // no params

    return $.ajax({
        method: "POST",
        crossDomain: false,
        url: connect_solutions_url,
        dataType:"json",
        data: {"json-data": JSON.stringify(ReportRequestData)},
        success: function(data, status, jqxr) { // this one call returns all of the data needed for the 3 pie charts
            this.ProcessPieChartData(data, status, jqxr);
        }.bind(this)}
    );
  }

  ProcessPieChartData(data, status, jqxr){
    try
    {
      // the 3 pie charts
      var data_array1 = dataParserUtils.processPieChartsJSONResult(JSON.parse(jqxr.responseText), true, "meetings");
      var data_array2 = dataParserUtils.processPieChartsJSONResult(JSON.parse(jqxr.responseText), true, "users");
      var data_array3 = dataParserUtils.processPieChartsJSONResult(JSON.parse(jqxr.responseText), true, "onDemand");
      //var chartData = [];
      //var chartLabels = [];

      if (data_array1.length > 0){
        for (var x=0; x < data_array1[0].label.length; x++){
          var groupID = jqxr.responseJSON.actionList[0].retvalMap["installation-report"].rows[x][0]; //ID
          var groupName = jqxr.responseJSON.actionList[0].retvalMap["installation-report"].rows[x][3]; //name
          // becareful calling async funcs in a loop
          // need to use closures...get some closure man
          // https://stackoverflow.com/questions/21819905/jquery-ajax-calls-in-for-loop
          //var tempChartData = this.GetChartData(sessionStorage.getItem("sessionKey"), groupID, groupName);
          //chartData.push(tempChartData);
          //chartLabels.push(tempChartData[0][0], tempChartData[1][0]);
          this.setState({loading: true});
          this.GetChartData(sessionStorage.getItem("sessionKey"), groupID, groupName, x);
        }
      }

      this.setState({
        PieChartData1: {labels: data_array1[0].label, datasets: data_array1},
        PieChartData2: {labels: data_array2[0].label, datasets: data_array2},
        PieChartData3: {labels: data_array3[0].label, datasets: data_array3},
        //ChartData: {labels: chartLabels, datasets: chartData},
        //loading: false
      });
    } catch (err) {
        console.log("THIS IS AN ERR: " + err);
    }
  }

  GetChartData(sessionKey, groupID, groupName, idx) {
    var ReportRequestData = xmlsenderutils.GetJSONDataToSend(sessionKey, 'query', 'connect', 'get-connect-per-minute-stats-report',
      [
        {name: "connect-installation-id", type: "id", value: groupID},
        {name: "minutes-back", type: "long", value: 0},
        {name: "minutes-range", type: "long", value: 10}
      ]
    );

    return $.ajax({
        method: "POST",
        crossDomain: false,
        url: connect_solutions_url,
        dataType:"json",
        data: {"json-data": JSON.stringify(ReportRequestData)},
        success: function(data, status, jqxr) {
          this.setState({loading: true});
          this.AddChartData(data, status, jqxr, groupID, groupName, idx);
      }.bind(this)} // not a fan of just inlining success and using bind
    ); //               can look at done() and using closures for sync needs
  }

  GetColorArray()
  {
    var colorArr = [11];

    // blues
    colorArr[0] = 'rgba(5, 112, 176, 0.25)';
    colorArr[4] = 'rgba(0, 130, 229, 0.25)';
    colorArr[8] = 'rgba(4, 90, 141, 0.25)';
    //purples
    colorArr[1] = 'rgba(173, 121, 242, 0.25)';
    colorArr[5] = 'rgba(2, 56, 88, 0.25)';
    colorArr[9] = 'rgba(54, 144, 192, 0.25)';
    //whites/very lights
    colorArr[2] = 'rgba(85, 136, 17, 0.25)';
    colorArr[6] = 'rgba(208, 209, 230, 0.25)';
    colorArr[10] = 'rgba(166, 189, 219, 0.25)';
    //brown
    colorArr [3] = 'rgba(255, 171, 2, 0.25)';
    colorArr [7] = 'rgba(100, 20, 100, 0.25)';

    return colorArr;
  }

  AddChartData(data, status, jqxr, groupID, groupName, idx)
  {
    try
    {
      // series total: {labelTime: sampleTime, x: sampleTime, y:totalValue}
      // series average: {labelTime: sampleTIme, x: sampleTime, y:averageValue}
      var seriesTotData = [];
      var seriesAvgData = [];
      var labelTot = groupName + "Tot";
      var labelAvg = groupName + "Avg";
      var colorArr = this.GetColorArray();
      var timestamps = [];

      for (var x=0; x < jqxr.responseJSON.actionList[0].retvalMap["per-minute-stats-report"].rows.length; x++){
        var sampledatestring = new Date(jqxr.responseJSON.actionList[0].retvalMap["per-minute-stats-report"].rows[x][0]);
        var sampleTime = moment(sampledatestring); //sample time

        if (sampleTime.year() < 2017){ // better check for a date now that i'm not seeing weird stuff
          console.log("WTFFFFFFFFFFFF");
        } else {
          timestamps.push(sampleTime);
          console.log ("OK DATE");
        }

        var totData, avgData;

        //var reportType = document.querySelector('input[name="dataType"]:checked').value; //value from the radio button

        if (reportType === "meetings"){
          totData = jqxr.responseJSON.actionList[0].retvalMap["per-minute-stats-report"].rows[x][2]; // meeting count
          avgData = jqxr.responseJSON.actionList[0].retvalMap["per-minute-stats-report"].rows[x][20]; // meeting count avg
        } else if (reportType === "users"){
          totData = jqxr.responseJSON.actionList[0].retvalMap["per-minute-stats-report"].rows[x][1]; // total users
          avgData = jqxr.responseJSON.actionList[0].retvalMap["per-minute-stats-report"].rows[x][23]; // total users avg
        } else if (reportType === "content"){
          totData = jqxr.responseJSON.actionList[0].retvalMap["per-minute-stats-report"].rows[x][7]; // content sessions
          avgData = jqxr.responseJSON.actionList[0].retvalMap["per-minute-stats-report"].rows[x][22]; // content sessions avg
        }

        seriesTotData.push({label: groupName + "Tot", x: sampleTime, y: totData});
        seriesAvgData.push({label: groupName + "Avg", x: sampleTime, y: avgData});
      }

      if (seriesTotData.length > 0){ // do we want to bother plotting this??
        // continually add to state
        // all async so not sure when it's done
        // refactor to use closures
        // check if the chartdata in state is empty/uninit
        // if it is create a fresh copy
        var data = [];
        if (this.state.ChartData !== undefined)
          data = this.state.ChartData.datasets;

        data.push({label: groupName + "Tot", data: seriesTotData, radius:0, backgroundColor: colorArr[idx]});
        data.push({label: groupName + "Avg", data: seriesAvgData, radius:0, backgroundColor: colorArr[idx]});
        this.setState({ ChartData: {datasets: data },
        loading:false});
      }
    } catch (err) {
      console.log("THIS IS AN ERR: " + err);
    }
  }

  RefreshPageData(type)
  {

    reportType = type;

    if (type=="meetings")
    {
      this.setState({meetingsbtnstatus:true,usersbtnstatus:false,contentbtnstatus:false});
    }
    else if (type=="users")
    {
      this.setState({meetingsbtnstatus:false,usersbtnstatus:true,contentbtnstatus:false});
    }
    else if (type=="content")
    {
      this.setState({meetingsbtnstatus:false,usersbtnstatus:false,contentbtnstatus:true});
    }

    console.log("UPDATE CHARTS");

    //this.state.ChartData = null;
    this.setState({ loading: true });
    this.UpdatePieCharts(sessionStorage.getItem("sessionKey"));
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
      max-width: 2000px;
      padding: 1em;`;

      const ContainerDiv1 = styled.div`
        margin-left: auto;
      	margin-right: auto;
      `;

    const PieChartContainerDiv = styled.div`
      display: inline-block;
      width: 500px;`;

    const PieChartContainerSetDiv = styled.div`
      align: center;`;

    const PieChartHeaderDiv = styled.div`
      text-align: center;
      font-family: 'Helvetica Neue';
      font-size: 20pt;
      padding-bottom: 1cm;`;

    const ChartParamDiv = styled.div`
      padding-left: 1cm;
      float: left;
      text-align: left;
      width:100%;
      height:50px;

      font-family: 'Helvetica Neue';
      font-size: 14pt;`;

    const Refresh = styled.div`
      float: left;
      text-align: left;
      width:100%;
      height:50px;

      font-family: 'Helvetica Neue';
      font-size: 14pt;`;

      return(
        <div className="App">
        <ContainerDiv1>
        <NavBar/>
        </ContainerDiv1>
        <ContainerDiv>
          <Refresh>

          </Refresh>
          <Loadable active ={ loading } spinner text='Calculating the data'>

          <br/>

          <PieChartContainerSetDiv>
            <PieChartContainerDiv>
              <PieChartHeaderDiv>Concurrent Meetings</PieChartHeaderDiv>
              <div><PieChart chartData={this.state.PieChartData1} /></div>
            </PieChartContainerDiv>

            <PieChartContainerDiv>
              <PieChartHeaderDiv>Concurrent Users</PieChartHeaderDiv>
              <div><PieChart chartData={this.state.PieChartData2} /></div>
            </PieChartContainerDiv>

            <PieChartContainerDiv>
              <PieChartHeaderDiv>On Demand Content</PieChartHeaderDiv>
              <div><PieChart chartData={this.state.PieChartData3} /></div>
            </PieChartContainerDiv>
          </PieChartContainerSetDiv>
          <br/>

          <ChartParamDiv>
            Line Chart Report Type: &nbsp;&nbsp;&nbsp;
            <ButtonGroup>
                <Button name = "Meetings" active={this.state.meetingsbtnstatus} onClick={() => this.RefreshPageData("meetings")}>Meetings</Button>
                <Button name = "Users" active={this.state.usersbtnstatus} onClick={() => this.RefreshPageData("users")}>Users</Button>
                <Button name = "Content" active={this.state.contentbtnstatus} onClick={() => this.RefreshPageData("content")}>Content</Button>
            </ButtonGroup>
          </ChartParamDiv>

          <Chart chartData={this.state.ChartData} />

          </Loadable>

          <Footer/>
        </ContainerDiv>
        </div>
      )
  }
}

export default Overview;
