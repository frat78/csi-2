import $ from 'jquery';
//this function builds the xml that needs to get sent to the API
export function GetXMLDataToSend(sessionKey, verb, object, type, paramList){
  var xmlData = "<transaction>"+
      "<session><session-key>"+sessionKey+"</session-key></session>"+
    "<action><definition><client-id>1</client-id><verb>"+verb+"</verb><object>"+object+"</object><type>"+type+"</type></definition>"+
    "<param-list>";
  if (paramList!=null) {
    for (var i=0;i<paramList.length;++i) {
     xmlData+="<simple-param>"+
          "<name>"+paramList[i].name+"</name>"+
          "<type>"+paramList[i].type+"</type>"+
          "<value>"+$('<div/>').text(paramList[i].value).html()+"</value>"+
        "</simple-param>";
    }
  }

  xmlData+="</param-list></action></transaction>";

  return xmlData;
};

export function GetJSONDataToSend(sessionKey, verb, object, type, paramList){
    var simpleParams = [];
    if (paramList!=null) {
      for (var i=0; i<paramList.length; ++i) {
        simpleParams[simpleParams.length] = {"name":paramList[i].name, "type":paramList[i].type, "value":paramList[i].value};
      }
    }

    var action = { "definition": {"verb":verb,"object":object,"type":type},"simpleParams":simpleParams}
    var jsonData = {"actions": [action], "session":{"sessionKey":sessionKey}};

    return jsonData;
};
