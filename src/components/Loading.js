import React, {Component} from 'react';

var styles = {
navBar: {
  backgroundColor: 'dark blue'
},
center: {
  textAlign: 'center'
},
rightNav: {
},
verticalLine: {
},
};

class Loading extends Component{
  
  static defaultProps = {
    sessionId:''
  }

  render(){
    return(
      <div style={styles.loadingicon}>
      <div style={styles.center}>
      <h2>Calculating data...... </h2>
      <div className="loader">
      </div>
      </div>
      </div>
          )
      }
}

export default Loading;
