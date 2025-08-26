import { Component,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as echarts from 'echarts';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { MyApiService } from '@app/service/my-api.service';
import { isTemplateRef } from 'ng-zorro-antd/core/util';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
@Component({
  selector: 'app-echarts-transactions',
  standalone: true,
  imports: [FormsModule,NzSelectModule,NzCalendarModule],
  templateUrl: './echarts-transactions.component.html',
  styleUrl: './echarts-transactions.component.less'
})
export class EchartsTransactionsComponent implements OnInit{

  params={
    account_book_id:null,
    data:'2024',
    year:null,
  }
  account_books: any[] = [];
  totalAmount:number = 0;
  constructor(public myApi : MyApiService) { }
  ngOnInit() {
    this.paramsInit();
    

  }
  initCharts(keys: any[],values: any[]) {
    const ec = echarts as any;
    const lineChart = ec.init(document.getElementById('lineChart'));
 
    const lineChartOption = {
 
      xAxis: {
        type: 'category',
        data: keys
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: values,
        type: 'bar',
        label:{
          show:true,
          position:'top'
        }
      }]
    }
    lineChart.setOption(lineChartOption);
 
  }
  initTwo(mapUserNames:Map<string,number>){
    console.log(mapUserNames);
    const ec = echarts as any;
    const lineChart = ec.init(document.getElementById('twoLineChart'));
    const  data: { value: number; name: string; }[]=[]
    mapUserNames.forEach((value,key)=>{
        data.push({
          value:value,
          name:key
        })
    })
   const option = {
      series: [
        {
          type: 'pie',
          data: data,
          itemStyle:{ 
            normal:{ 
               label:{ 
                  show: true, 
                  formatter: '{b} : {c} ({d}%)' 
                  }, 
                  labelLine :{show:true} 
                  } 
             } 

        }
      ]
    };
    lineChart.setOption(option);
  }

  typeChart(typeChart :Map<string,number>){
    const ec = echarts as any;
    const lineChart = ec.init(document.getElementById('typeChart'));
    const option = {
      xAxis: {
        max: 'dataMax'
      },
      yAxis: {
        type: 'category',
        data: [...typeChart.keys()],
        inverse: true,
        animationDuration: 300,
        animationDurationUpdate: 300,
        max: 8 // only the largest 3 bars will be displayed
      },
      series: [
        {
          realtimeSort: true,
          name: 'X',
          type: 'bar',
          data: [...typeChart.values()],
          label: {
            show: true,
            position: 'right',
            valueAnimation: true
          }
        }
      ],
      legend: {
        show: true
      },
      animationDuration: 3000,
      animationDurationUpdate: 3000,
      animationEasing: 'linear',
      animationEasingUpdate: 'linear'
    };
    
    lineChart.setOption(option);
  }
  paramsInit(){
    this.myApi.get('/account_book/all-enum').then(res => {
      if (res.code === 200) {
        //
        this.account_books = res.data;
      }
    });
  }
  getData(){
    this.myApi.get('/formsql/data/1917188507180253186?accountId='+this.params.account_book_id).then(res => {
      if (res.code === 200) {
        const map = new Map();
        const mapUserNames = new Map();
        const typeChart = new Map();
        this.totalAmount = 0;
        res.data.forEach((item:any)=>{
          this.totalAmount += item.value;

          const name = item.userName;
          let userValue = item.value;
          if(mapUserNames.has(name)){
            userValue = mapUserNames.get(name)+item.value;
          }
          userValue = Math.round(userValue * 100) / 100;;
          mapUserNames.set(name,userValue);

          
          const type = item.type;
          let typeValue = item.value;
          if(typeChart.has(type)){
            typeValue = typeChart.get(type)+item.value;
            
          }
          typeValue = Math.round(typeValue * 100) / 100;;
          typeChart.set(type,typeValue);


          const  key = item.time.slice(0,7);
          let value = item.value;
          if(map.has(key)){
            value = map.get(key)+item.value;
          }
          value = Math.round(value * 100) / 100;;
          map.set(key,value);
        })
        this.initCharts([...map.keys()].reverse(),[...map.values()].reverse());
        this.initTwo(mapUserNames);
        this.typeChart(typeChart);
        this.totalAmount = Math.round(this.totalAmount * 100) / 100;
        // const ec = echarts as any;
        // const lineChart = ec.init(document.getElementById('lineChart'));
     
        // const lineChartOption = {
     
        //   xAxis: {
        //     type: 'category',
        //     data: [...map.keys()].reverse()
        //   },
        //   yAxis: {
        //     type: 'value'
        //   },
        //   series: [{
        //     data: [...map.values()].reverse(),
        //     type: 'bar',
        //     label:{
        //       show:true,
        //       position:'top'
        //     }
        //   }]
        // }
        // lineChart.setOption(lineChartOption);
      }
    });
  }

}
