import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';

class Usage extends Component{
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
            unit: 'year',
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

                    // Loop through all datasets to get the actual total of the index
                    var total = 0;
                    var maxNonHidden = 0;

                    for (var i = 0; i < data.datasets.length; i++) {
                      if (!data.datasets[i]._meta[0].hidden)
                        maxNonHidden = i;

                      if (data.datasets[i].label !== "Limit" && data.datasets[i].label !== "Total" && !data.datasets[i]._meta[0].hidden)
                        total += parseInt(data.datasets[i].data[tooltipItem.index].y);
                    }

                    if (tooltipItem.datasetIndex === maxNonHidden && data.datasets[tooltipItem.datasetIndex].label !== "Total")
                      return [corporation + " : " + valor.y, "Total : " + total];
                    else
                      return corporation + " : " + valor.y;


                    //if (corporation == "Limit"){
                    //  return [corporation + " : " + valor.y, "Total : " + total];
                    //} else {
                    //  return corporation + " : " + valor.y;
                    //}

                    // If it is not the last dataset, you display it as you usually do
                    //if (tooltipItem.datasetIndex != data.datasets.length - 1) {
                    //    return corporation + " : " + valor.y;
                    //} else { // .. else, you display the dataset and the total, using an array
                    //    return [corporation + " : " + valor.y, "Total : " + total];
                    //}
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

export default Usage;
