import BaseForm from "@model/base-form";
import {MyApiService} from "@service/my-api.service";
import {ActivatedRoute} from "@angular/router";

export default class SingelSetFormModel extends BaseForm {
    id: string = "";

    updateObj:any={};

    


    constructor(public override myApi: MyApiService, public route: ActivatedRoute) {
        super(myApi);
        this.route.queryParams.subscribe(async res => {
            this.id = res['id'];
            this.menuCode = res['menuCode'];
            this.menuName = res['menuName'];
            await this.getBtns(); 
            this.undo();
            
        });
        this.route.params.subscribe(async (res) => {
            this.formId = res['formId'];
            await this.parse();
            this.disabled = true;
        })

    }

    btnClick(code: string) {
        if (code === 'add') {
            this.add();
        } else if (code === 'undo') {
            this.undo();
        } else if (code === 'save') {
            this.save();
        } else if (code === 'query') {
            this.query();
        } else if (code === 'edit') {
            this.edit();
        }
        else if (code === 'delete') {
            this.delete();
        }
    }


    add() {
        this.id = "";
        this.restForm();
        this.disabled = false;
        this.btns.forEach(it => {
            it.disable = it.code === 'add' || it.code === 'edit' || it.code === 'delete';
        })
    }

    undo() {
        if (!this.isInit) {
            setTimeout(() => this.undo(), 200);
            return;
        }
        this.disabled = true;
        if (this.id) {
            this.myApi.get(this.serverUrl, {id: this.id}).then(res => {
                if (res.code === 200) {
                    this.updateObj = res.data;
                    this.formCols.forEach(it => {
                       
                        if(res.data[it.code]){
                            if (it.type === 'date') {
                                it.value = this.myApi.dateParse(res.data[it.code]);
                            } else if (it.type === 'datetime') {
                                it.value  = this.myApi.datetimeParse(res.data[it.code]);
                            } else if (it.type === 'time') {
                                it.value = this.myApi.timeParse(res.data[it.code]);
                            } else{
                                it.value = res.data[it.code];
                            }
                        }
                    })
                    this.btns.forEach(it => {
                        it.disable = it.code === 'undo' || it.code === 'save' || it.code === 'delete';
                    })
                }
            })
        } else {
            this.restForm();
            this.btns.forEach(it => {
                it.disable = it.code === 'undo' || it.code === 'save' || it.code === 'edit' || it.code === 'delete';
            })
        }


    }

    save() {
        for(let it of this.formCols){
            if(it.required && !it.value){
                this.myApi.warning(`${it.label}不能为空`);
                return;
            }
        }
        
        let data = this.getFormColsData();
       
        
        if (this.id) {
            for(let code in data){
                this.updateObj[code] = data[code];
            }
            this.myApi.put(this.serverUrl, this.updateObj).then(res => {
                if (res.code === 200) {
                    this.myApi.success("保存成功")
                    this.undo();
                }
            })
        } else {
            this.myApi.post(this.serverUrl, data).then(res => {
                if (res.code === 200) {
                    this.myApi.success("保存成功");
                    this.undo();
                }
            })
        }
    }

    query() {
        this.myApi.navigate(this.path);
    }

    edit() {
        this.disabled = false;
        this.btns.forEach(it => {
            it.disable = it.code === 'add' || it.code === 'edit';
        })
    }

    delete(){
        if (this.id) {
            this.myApi.delete(`${this.serverUrl}?id=${this.id}`).then(res => {
                if (res.code === 200) {
                    this.myApi.success("删除成功");
                    this.id = "";
                    this.restForm();
                    this.undo();
                }
            })
        }
    }

    private restForm(){
        this.formCols.forEach(it=>{
            it.value = it.defaultValue;
        })
    }
}
