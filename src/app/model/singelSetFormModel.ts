import BaseForm from "@model/base-form";
import {MyApiService} from "@service/my-api.service";
import {ActivatedRoute} from "@angular/router";

export default class SingelSetFormModel extends BaseForm {
    id: string = "";

    updateObj:any={};

    constructor(public override myApi: MyApiService, public route: ActivatedRoute) {
        super(myApi);
        this.route.queryParams.subscribe(res => {
            this.id = res['id'];
            this.menuCode = res['menuCode'];
            this.menuName = res['menuName'];
        
            this.undo();
            this.getBtns(); 
        });
        this.route.params.subscribe(async (res) => {
            this.formId = res['formId'];
            await this.parse();
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
        this.validateForm.enable();
        this.validateForm.reset();
        this.formCols.forEach(it => {
            this.validateForm.controls[it.code].enable();
        })
        this.btns.forEach(it => {
            it.disable = it.code === 'add' || it.code === 'edit' || it.code === 'delete';
        })
    }

    undo() {
        if (!this.isInit) {
            setTimeout(() => this.undo(), 200);
            return;
        }
        this.validateForm.disable();
        if (this.id) {
            this.myApi.get(this.serverUrl, {id: this.id}).then(res => {
                if (res.code === 200) {
                    this.updateObj = res.data;
                    const obj: any = {};
                    this.formCols.forEach(it => {
                        obj[it.code] = res.data[it.code];
                        if (it.type === 'date') {
                            obj[it.code] = this.myApi.dateParse(obj[it.code]);
                        } else if (it.type === 'datetime') {
                            obj[it.code] = this.myApi.datetimeParse(obj[it.code]);
                        } else if (it.type === 'time') {
                            obj[it.code] = this.myApi.timeParse(obj[it.code]);
                        }
                    })
                    this.validateForm.setValue(obj);
                    this.btns.forEach(it => {
                        it.disable = it.code === 'undo' || it.code === 'save' || it.code === 'delete';
                    })
                }
            })
        } else {
            this.validateForm.reset();
            this.btns.forEach(it => {
                it.disable = it.code === 'undo' || it.code === 'save' || it.code === 'edit' || it.code === 'delete';
            })
        }


    }

    save() {
        if (!this.validateForm.valid) {
            Object.values(this.validateForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({onlySelf: true});
                }
            });
            return;
        }
        let data = this.validateForm.value;
        this.formCols.forEach(it => {
            if (it.type === 'date') {
                data[it.code] = this.myApi.dateFormat(data[it.code]);
            } else if (it.type === 'datetime') {
                data[it.code] = this.myApi.datetimeFormat(data[it.code]);
            } else if (it.type === 'time') {
                data[it.code] = this.myApi.timeFormat(data[it.code]);
            }
        })
        data = Object.keys(data)
        .filter(key => !key.startsWith('_'))
        .reduce((acc : any, key) => {
            acc[key] = data[key];
            return acc;
        }, {});
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
        this.formCols.forEach(it => {
            this.validateForm.controls[it.code].enable();
        })
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
                    this.validateForm.reset();
                    this.undo();
                }
            })
        }
    }
}
