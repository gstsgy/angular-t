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
        }else if(code==='export'){
            this.export();
        }
        else if(code==='exportAll'){
            this.exportAll();
        }
    }

    refresh() {
        if(!this.validateForm.valid){
            Object.values(this.validateForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({onlySelf: true});
                }
            });
            return;
        }
        let obj:any={...this.validateForm.value,...this.searchQuery}
        this.data = []
        this.myApi.get(this.serverUrl, obj).then(res => {
            this.searchQuery.total = res.data.total - 0;
            this.data = res.data.records;
        })
    }

    nzQueryParamsFun(params: NzTableQueryParams){
        if(params && params.pageIndex){
            this.searchQuery.pageNum = params.pageIndex;
            this.searchQuery.pageSize = params.pageSize;
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
        if(!this.validateForm.valid){
            Object.values(this.validateForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({onlySelf: true});
                }
            });
            return;
        }
        let obj:any={...this.validateForm.value,...this.searchQuery}
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
