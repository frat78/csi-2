import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';

class Chart extends Component{
  constructor(props){
    super(props);
    // this.state = {
    //   chartData:props.chartData
    // }
  }

  static defaultProps = {
    displayTitle:true,
    timePeriod:'All Time',
    displayLegend: true,
    legendPosition:'right'
  }

  render(){
    return (
      <div className="chart">
      <Line
        data={this.props.chartData}
        options={{
          scales: {
          xAxes: [{
            margin: 0,
            padding: 0,
            type: 'time',
            unit: 'minute',
            unitStepSize: 2,
            ticks:{
              bounds: 'label',
              beginAtZero:true,
              minRotation: 45
            },
            time: {
              displayFormats: {
                 'minute': 'MMM DD'
              }}
            }]
          },
          responsive: true,
          hover: {
            mode: 'index',
            intersect: false
          },
          tooltips: {
            position: 'average',
            caretSize: 20,
            mode: 'index',
            intersect: false,
          title:{
            fontSize:25}
          ,
          legend:{
            display:this.props.displayLegend,
            position:this.props.legendPosition
          }}
        }}
      />

      </div>
    )
  }
}

export default Chart;
