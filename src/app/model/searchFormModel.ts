import BaseForm from "@model/base-form";
import {MyApiService} from "@service/my-api.service";
import {ActivatedRoute} from "@angular/router";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {FormsModel} from "@model/forms";

export default class SearchFormModel extends BaseForm  {
    constructor(public override myApi: MyApiService,public route:ActivatedRoute) {
        super(myApi);
        this.route.queryParams.subscribe(res => {
            this.menuCode = res['menuCode'];
            this.menuName = res['menuName'];
            this.getBtns(); 
        });
        this.route.params.subscribe((res)=>{
            this.formId = res['formId'];
            this.parse();
        })

        // 组装commonObjs
        const myObj = this;
        this.getInstanceMethods(this).forEach(key=>{

            const value = myObj[key as keyof this];

            if (typeof value === 'function') {
              // 备份方法
              this.commonObjs[key] = value.bind(myObj);
        
              // 重新定义为 getter/setter
              Object.defineProperty(myObj, key, {
                get: () => this.commonObjs[key],
                set: (fn) => {
                    this.commonObjs[key] = fn.bind(myObj);
                },
                configurable: true,
                enumerable: true
              });
            } else {
              // 普通属性也可以做类似处理（可选）
              this.commonObjs[key] = value;
              Object.defineProperty(myObj, key, {
                get: () => this.commonObjs[key],
                set: (v) => {
                  //console.log(`属性 ${key} 被修改为 ${v}`);
                  this.commonObjs[key] = v;
                },
                configurable: true,
                enumerable: true
              });
            }
        })
       
    }
    commonObjs:any={}
    getInstanceMethods(instance:Object) {
        let methods = [];
        let obj = instance;
      
        do {
          methods.push(...Object.getOwnPropertyNames(obj));
        } while (obj = Object.getPrototypeOf(obj));
      
        methods= [...new Set(methods)];
        const filterMethods = ['constructor','hasOwnProperty','isPrototypeOf','propertyIsEnumerable','toLocaleString','toString','valueOf','commonObjs','getInstanceMethods']
        return methods.filter(item => filterMethods.indexOf(item)===-1&& !item.startsWith('__'));

      }
    
    data:any[]=[]

    selectData:any[] = []

    searchQuery: any = {
        pageNum: 1,
        pageSize: 50,
        total: 0
    }

    btnClick(code:string){
        if(code==='refresh'){
            this.refresh();
          //  console.log(2222)
        }else if(code==='export'){
            this.export();
        }
        else if(code==='exportAll'){
            this.exportAll();
        }
    }

    refresh() {
        for(let it of this.formCols){
            if(it.required && !it.value){
                this.myApi.warning(`${it.label}不能为空`);
                return;
            }
        }
        
        let data = this.getFormColsData();
        data['pageNum']= this.searchQuery.pageNum;
        data['pageSize'] = this.searchQuery.pageSize;
        this.myApi.get(this.serverUrl, data).then(res => {
            if(res.code===200||res.data){
                this.searchQuery.total = res.data.total - 0;
                this.data = res.data.records;
                console.log(this.data)
            }
           
        })
    }

    nzQueryParamsFun(params: NzTableQueryParams){
        if(params && params.pageIndex){
            this.searchQuery.pageNum = params.pageIndex;
            this.searchQuery.pageSize = params.pageSize;
           // console.log(11111)
            this.refresh();
        }
    }


    gotoSetForm(obj:{ row: any, col: FormsModel }){
        if(this.path){
            this.myApi.navigateById(this.path,obj.row.id);
        }
    }

    getSelected(data:any[]){
        this.selectData = data;
    }
    formation(form:FormsModel,value:any ){
        if(form.type==='select'||form.type==='radio'){
            const item = form.options?.find(item => item.value === value);
            if(item){
                return item.label;
            }
            return value;
        }
        return value;
    }
    export(){
        if(this.selectData.length===0){
            this.myApi.warning('请选择要导出的数据');
            return;
        }
       const arr =this.selectData.map((item : any,idx)=>{
            const obj = {} as any;
            this.formGrids.forEach(it=>{
                if(it.code==='_Index'){
                    obj[it.label??it.code] = idx+1
                }else{
                    obj[it.label??it.code] = this.formation(it,item[it.code])
                }
                
            })
            return obj;
        }) 
        this.myApi.exportToExcel(arr,this.menuName);
    }

    async exportAll(){
        for(let it of this.formCols){
            if(it.required && !it.value){
                this.myApi.warning(`${it.label}不能为空`);
                return;
            }
        }
        
       let obj = this.getFormColsData();
       obj['pageNum']= 1;
       obj['pageSize'] = 50000;
       const res = await this.myApi.get(this.serverUrl, obj);
       const arr =res.data.records.map((item : any,idx:number)=>{
            const obj = {} as any;
            this.formGrids.forEach(it=>{
                if(it.code==='_Index'){
                    obj[it.label??it.code] = idx+1
                }else{
                    obj[it.label??it.code] = this.formation(it,item[it.code])
                }
                
            })
            return obj;
        }) 
        this.myApi.exportToExcel(arr,this.menuName);
    }
}
