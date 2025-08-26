import { Component,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as echarts from 'echarts';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { MyApiService } from '@app/service/my-api.service';
import { isTemplateRef } from 'ng-zorro-antd/core/util';
@Component({
  selector: 'app-echarts-transactions',
  standalone: true,
  imports: [FormsModule,NzSelectModule],
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
        res.data.forEach((item:any)=>{
          const name = item.userName;
          let userValue = item.value;
          if(mapUserNames.has(name)){
            userValue = mapUserNames.get(name)+item.value;
          }
          userValue = Math.round(userValue * 100) / 100;;
          mapUserNames.set(name,userValue);


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
