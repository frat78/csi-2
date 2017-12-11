import React, {
  Component
} from 'react';
import './ReactDataGridStyles.css';
import styled from 'styled-components';
import * as xmlsenderutils from '../XMLSendingPacket.js';
import $ from 'jquery';
import ReactDataGrid from 'react-data-grid';
//import PropTypes from 'prop-types';

const { Row } = ReactDataGrid;

var connect_solutions_url = "https://sjccc.connectsolutions.com/start/transaction/actions.do";

class RowRenderer extends Component {

  setScrollLeft = (scrollBy) => {
    // if you want freeze columns to work, you need to make sure you implement this as apass through
    this.row.setScrollLeft(scrollBy);
  };

  getRowStyle = () => {
    // fill-in with any custom css styling
    return {
    };
  };

  render() {
    // here we are just changing the style
    // but we could replace this with anything we liked, cards, images, etc
    // usually though it will just be a matter of wrapping a div, and then calling back through to the grid
    return (<div style={this.getRowStyle()}><Row ref={ node => this.row = node } {...this.props}/></div>);
  }
}

class Meetings extends Component{
  constructor(props){
    super(props);

    this._columns = [
          {
            key: 'account_name',
            name: 'Account Name'
          },
          {
            key: 'meetings_count',
            name: 'Meetings'
          },
          {
            key: 'users_count',
            name: 'Users'
          }
        ];

    this.state = {
      rows: [],
      selectedIndexes: [],
      redirect: false
    };
  }

  componentWillMount() {
    //this page cannot be shown if the session is non existent
    if (sessionStorage.getItem("sessionKey") === 'undefined' || sessionStorage.getItem("sessionKey") === null)
    {
      this.setState({ redirect: true })
    }
    else
     {
       //grab a list of all connect installations (backbone for this component)
       this.GetConnectInstallations(sessionStorage.getItem("sessionKey"));
       this.GetFlaggedMeetings(sessionStorage.getItem("sessionKey"));
     }
  }

  componentDidMount() {
    //called after the component has been rendered into the page
  }

  getSize = () => {
      return this.state.rows.length;
  };

  getRowAt = (index) => {
    if (index < 0 || index > this.getSize()) {
      return undefined;
    }
    return this.state.rows[index];
  };

  onRowsSelected = (rows) => {
    this.setState({selectedIndexes: rows.map(r => r.rowIdx)});
  };

  onRowsDeselected = (rows) => {
    this.setState({selectedIndexes: []});
  };

  onRowClick = (rowIdx, row) => {
    this.setState({selectedIndexes: [rowIdx]});
  }

  processResellerInstallationReportJSONResult(transactionResponse) {
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

          var processedResult = installationReport.rows.map((account, index, accounts) => {
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

      //alert(JSON.stringify(groupOptions))
      return processedResult;
  };


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
          var result = this.processResellerInstallationReportJSONResult(JSON.parse(jqxr.responseText));
          this.setState({rows: result});
        }.bind(this)}
      );
  };

  GetDashboardReports(sessionKey) {
    //Get Connect Installations Listing, using session ID from session storage
    var GetDashboardReportsRequestData = xmlsenderutils.GetJSONDataToSend(sessionKey, 'query', 'connect', 'get-dashboard-reports',
      [
        {name: "connect-installation-key", type: "string", value: "kRv0urpeYotDuNKGS3NAZ9LgBPrOgs"},
      ]);

    return $.ajax({
      method: "POST",
      crossDomain: false,
      url: connect_solutions_url,
      dataType:"json",
      data: {"json-data": JSON.stringify(GetDashboardReportsRequestData)},
      success: function(data, status, jqxr) {
        console.log(JSON.parse(jqxr.responseText));
          //var result = this.processResellerInstallationReportJSONResult(JSON.parse(jqxr.responseText));
          //this.setState({rows: result});
        }.bind(this)}
      );
  };

  GetFlaggedMeetings(sessionKey) {
    //Get Connect Installations Listing, using session ID from session storage
    var GetFlaggedMeetingsRequestData = xmlsenderutils.GetJSONDataToSend(sessionKey, 'query', 'connect', 'list-flagged-meetings',
      [
        {name: "connect-installation-id", type: "id", value: 78},
      ]);

    return $.ajax({
      method: "POST",
      crossDomain: false,
      url: connect_solutions_url,
      dataType:"json",
      data: {"json-data": JSON.stringify(GetFlaggedMeetingsRequestData)},
      success: function(data, status, jqxr) {
        console.log(JSON.parse(jqxr.responseText));
          //var result = this.processResellerInstallationReportJSONResult(JSON.parse(jqxr.responseText));
          //this.setState({rows: result});
        }.bind(this)}
      );
  };

  render() {
    return (
      <div>
        <h4>Accounts</h4>
        <ReactDataGrid
          rowKey="id"
          columns={this._columns}
          rowGetter={this.getRowAt}
          rowsCount={this.getSize()}
          minHeight={200}
          onRowClick={this.onRowClick}
          enableRowSelect={true}
          rowSelection={{
            showCheckbox: false,
            enableShiftSelect: false,
            onRowsSelected: this.onRowsSelected,
            onRowsDeselected: this.onRowsDeselected,
            selectBy: {
              indexes: this.state.selectedIndexes
            }
          }}
          rowRenderer={RowRenderer}
        />
      </div>
    )
  }
}

export default Meetings;
