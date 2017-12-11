import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';

class HourlyPeakConcurrencyChart extends Component{
  constructor(props){
    super(props);
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
            unit: 'day',
            unitStepSize: 1,
            ticks:{
              bounds: 'label',
              beginAtZero:true,
              minRotation: 45
            },
            time: {
              displayFormats: {
                 'day': 'MMM DD'
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
            callbacks: {
                label: function(tooltipItem, data) {
                    var corporation = data.datasets[tooltipItem.datasetIndex].label;
                    var valor = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                }
            }
          },
          title:{
            display:this.props.displayTitle,
            text:this.props.selectedGroup + ' Global Concurrent Users ' + this.props.timePeriod,
            fontSize:25
          ,
          legend:{
            display:this.props.displayLegend,
            position:this.props.legendPosition
          }
        }}}
      />

      </div>
    )
  }
}

export default HourlyPeakConcurrencyChart;
