import moment from 'moment';

export function processGlmGroupsJSONResult(transactionResponse) {
  var groupOptions = [];

  var transactionInfo = transactionResponse["transactionInfo"];
  var actionList = transactionResponse["actionList"];

  if (transactionInfo.errorCode === "OK" &&
      typeof actionList !== 'undefined' &&
      actionList.length > 0 &&
      actionList[0].actionStatus === "ok") {
    var retvalMap = actionList[0].retvalMap;
    if (typeof retvalMap !== 'undefined' &&
        typeof retvalMap["glm-groups"] !== 'undefined' &&
        typeof retvalMap["glm-groups"].rows !== 'undefined') {
      var groupRows = retvalMap["glm-groups"].rows;

      for (var i = 0; i < groupRows.length; i++) {
        if (groupRows[i].length === 2) {
          groupOptions.push({
            value: groupRows[i][0],
            display: groupRows[i][1]
          });
        }
      }
    }
  }
  //alert(JSON.stringify(groupOptions))
  return groupOptions;
};

export function processInstallationsJSONResult(transactionResponse) {
  var groupOptions = [];

  var transactionInfo = transactionResponse["transactionInfo"];
  var actionList = transactionResponse["actionList"];

  if (transactionInfo.errorCode === "OK" &&
      typeof actionList !== 'undefined' &&
      actionList.length > 0 &&
      actionList[0].actionStatus === "ok") {

    var retvalMap = actionList[0].retvalMap;
    if (typeof retvalMap !== 'undefined' &&
        typeof retvalMap["installation-report"] !== 'undefined' &&
        typeof retvalMap["installation-report"].rows !== 'undefined') {
      var groupRows = retvalMap["installation-report"].rows;

      for (var i = 0; i < groupRows.length; i++) {
          groupOptions.push({
            value: groupRows[i][0],
            display: groupRows[i][3]
          });
      }
    }
  }
  //alert(JSON.stringify(groupOptions))
  return groupOptions;
};

export function processGLMQuotaJSONResult(transactionResponse, useExactTime) {
    var processedResult = [];
    var transactionInfo = transactionResponse["transactionInfo"];
    var actionList = transactionResponse["actionList"];

    if (transactionInfo.errorCode === "OK" &&
        typeof actionList !== 'undefined' &&
        actionList.length > 0 &&
        actionList[0].actionStatus === "ok") {
      var retvalMap = actionList[0].retvalMap;
      if (typeof retvalMap !== 'undefined') {
        var installList = retvalMap["install-list"];
        var glmQuotaReport = retvalMap["glm-quota-report"];

        if (typeof installList !== 'undefined' &&
            typeof installList.rows !== 'undefined' &&
            typeof glmQuotaReport !== 'undefined' &&
            typeof glmQuotaReport.rows !== 'undefined') {
          var accountNames = [];
          var series = [];
          for (var il = 0; il < installList.rows.length; il++) {
            accountNames.push(installList.rows[il][1]);
            var ar = [];
            series.push(ar);
          }

          var exactHoursArr = [];
          var exactTimesArr = [];
          var totalsArr = [];
          var limitsArr = [];
          for (var r = 0; r < glmQuotaReport.rows.length; r++) {
            exactHoursArr.push(moment(glmQuotaReport.rows[r][0]).toDate());
            exactTimesArr.push(moment(glmQuotaReport.rows[r][1]).toDate());
            totalsArr.push(glmQuotaReport.rows[r][2]);
            limitsArr.push(glmQuotaReport.rows[r][3]);
            for (var ai = 0; ai < installList.rows.length; ai++) {
              series[ai].push(glmQuotaReport.rows[r][(4 + ai)]);
            }
          }

          var timeScale = exactTimesArr;
          if (useExactTime === true) {
              timeScale = exactTimesArr;
          } else {
              timeScale = exactHoursArr;
          }

          for (var s=0; s < series.length; s++) {
            var seriesLine = [];
            for (var j=0; j < timeScale.length; j++) {
              seriesLine.push({
                  labelTime: exactHoursArr[j],
                  x: timeScale[j],
                  y: series[s][j]
              });
            }

            var colorArr = [10];

            // blues
            colorArr[0] = 'rgba(5, 112, 176, 0.75)';
            colorArr[4] = 'rgba(0, 130, 229, 0.5)';
            colorArr[8] = 'rgba(4, 90, 141, 0.75)';

            //purples
            colorArr[1] = 'rgba(173, 121, 242, 0.75)';
            colorArr[5] = 'rgba(2, 56, 88, 1)';
            colorArr[9] = 'rgba(54, 144, 192, 0.5)';


            //whites/very lights
            colorArr[2] = 'rgba(85, 136, 17, 0.5)';
            colorArr[6] = 'rgba(208, 209, 230, 0.75)';
            //colorArr[10] = 'rgba(166, 189, 219, 0.25)';

            //brown
            colorArr [3] = 'rgba(255, 171, 2, 0.75)';
            colorArr [7] = 'rgba(100, 20, 100, 0.5)';

            processedResult.push({label: accountNames[s], data: seriesLine, radius:0, backgroundColor: colorArr[s]});
          }

          var totalLine = [];
          var limitLine = [];
          for (var i = 0; i < timeScale.length; i++) {

              totalLine.push({
                  x: timeScale[i],
                  y: totalsArr[i]
              });

              limitLine.push({

                  x: timeScale[i],
                  y: limitsArr[i]
              });
          }

          processedResult.push({label: "Limit", data: limitLine, fill: false, backgroundColor: 'rgba(255, 0, 0, 0.6)'});
          processedResult.push({label: "Total", data: totalLine, fill: false, radius:1, backgroundColor: 'rgba(54, 162, 235, 0.6)'});
        }
      }
  }

  //alert(JSON.stringify(groupOptions))
  return processedResult;
};

export function processPieChartsJSONResult(transactionResponse, useExactTime, reportType) {
    var processedResult = [];
    var transactionInfo = transactionResponse["transactionInfo"];
    var actionList = transactionResponse["actionList"];

    if (transactionInfo.errorCode === "OK" && typeof actionList !== 'undefined' &&
        actionList.length > 0 && actionList[0].actionStatus === "ok") {

      var retvalMap = actionList[0].retvalMap;

      if (typeof retvalMap !== 'undefined') {
        var installList = retvalMap["installation-report"];

        if (typeof installList !== 'undefined' && typeof installList.rows !== 'undefined') {
            var datapoints = [];
            var accountNames = [];
            var meetings = [];
            var users = [];
            var ondemandUsers = [];

            for (var r = 0; r < installList.rows.length; r++) {
              accountNames.push(installList.rows[r][3]);

              if (reportType === "meetings"){
                datapoints.push(installList.rows[r][12]);
                //meetings.push(installList.rows[r][12]);
              } else if (reportType === "users"){
                datapoints.push(installList.rows[r][13]);
                //users.push(installList.rows[r][13]);
              } else if (reportType === "onDemand"){
                datapoints.push(installList.rows[r][14]);
                //ondemandUsers.push(installList.rows[r][14]);
              }
            }

            //datapoints.push(meetings);
            //datapoints.push(users);
            //datapoints.push(ondemandUsers);

            var colorArr = [10];

            // blues
            colorArr[0] = 'rgba(5, 112, 176, 0.75)';
            colorArr[4] = 'rgba(0, 130, 229, 0.5)';
            colorArr[8] = 'rgba(4, 90, 141, 0.75)';
            //purples
            colorArr[1] = 'rgba(173, 121, 242, 0.75)';
            colorArr[5] = 'rgba(2, 56, 88, 1)';
            colorArr[9] = 'rgba(54, 144, 192, 0.5)';
            //whites/very lights
            colorArr[2] = 'rgba(85, 136, 17, 0.5)';
            colorArr[6] = 'rgba(208, 209, 230, 0.75)';
            //colorArr[10] = 'rgba(166, 189, 219, 0.25)';
            //brown
            colorArr [3] = 'rgba(255, 171, 2, 0.75)';
            colorArr [7] = 'rgba(100, 20, 100, 0.5)';

            processedResult.push({label: accountNames, data: datapoints, backgroundColor: colorArr});
            //processedResult.push({label: accountNames, data: users, backgroundColor: colorArr});
            //processedResult.push({label: accountNames, data: ondemandUsers, backgroundColor: colorArr});
        } // end installList
      } // end retvalMap
    } // end transaction Info

    return processedResult;
}; // end Pie Charts
