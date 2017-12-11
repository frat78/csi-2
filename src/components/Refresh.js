import React, {
  Component
} from 'react';

class Refresh extends Component{
  constructor(props){
    super(props);
    this.state = {
      intervalElapsed: -1
    };

    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    this.setState({intervalElapsed: 0});
    this.interval = setInterval(this.tick, this.props.seconds*1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  tick() {
    this.setState({intervalElapsed: this.state.intervalElapsed + 1});
  }

  render() {
    return (
      <div>
        {this.props.children}
        <div>{this.state.intervalElapsed}</div>
      </div>
    )
  }
}

export default Refresh;
