import {MyApiService} from "@service/my-api.service";
import {BtnModel, DataSource, FormsModel} from "@model/forms";
import {FormGroup, Validators} from "@angular/forms";
import { UserService } from "@app/service/user.service";

export default class BaseForm {
    isInit: boolean = false;

    isSelected = false;

    formId: string = "";

    menuCode: string = "";

    menuName: string = "";

    formCols: Array<FormsModel> = []

    validateForm: FormGroup = new FormGroup({});

    formGrids: Array<FormsModel> = []

    btns: Array<BtnModel> = []

    serverUrl: string = ""

    path: string = ""

    name: string = ""

    public myApi: MyApiService;

    constructor(myApi: MyApiService) {
        this.myApi = myApi;
    }

    async parse() {
        await this.myApi.get('form/info', {formId: this.formId}).then(res => {
            if (res.code === 200) {
                this.serverUrl = res.data.serverUrl;
                this.path = res.data.path;
                this.name = res.data.name;
                this.isSelected = res.data.isSelected;
            }
        })

        await this.myApi.get('form/cols', {formId: this.formId}).then(res => {
            if (res.code === 200) {
                this.formCols = res.data;
                const obj: any = {};
                this.formCols.forEach(async item => {
                    item.defaultValue = this.getDefaultValue(item.defaultValue);
                    obj[item.code] = this.myApi.fb.control({
                        value: item.defaultValue,
                        disabled: item.disabled ?? false
                    }, item.required ? [Validators.required] : []);
                    if (item.optionModel) {
                        const dataSource:DataSource = JSON.parse(item.optionModel);
                        if(dataSource.type === 'static'){
                            item.options = dataSource.dataSource;
                        }else if(dataSource.type === 'dict'){
                            this.myApi.getDict(dataSource.code).subscribe(res => {
                                item.options = res;
                            })
                        }else if(dataSource.type === 'api'){
                            this.myApi.request(dataSource.method??'get',dataSource.url??'', dataSource.params).then(res => {
                                item.options = res.data;
                            })
                        }
                        
                    }
                })
                this.validateForm = this.myApi.fb.group(obj);


            }
        })

        await this.myApi.get('form/grids', {formId: this.formId}).then(res => {
            if (res.code === 200) {
                this.formGrids = res.data;
                this.formGrids.forEach(async item => {
                    item.defaultValue = this.getDefaultValue(item.defaultValue);
                    if (item.optionModel) {
                        const dataSource:DataSource = JSON.parse(item.optionModel);
                        if(dataSource.type === 'static'){
                            item.options = dataSource.dataSource;
                        }else if(dataSource.type === 'dict'){
                            this.myApi.getDict(dataSource.code).subscribe(res => {
                                item.options = res;
                            })
                        }else if(dataSource.type === 'api'){
                            this.myApi.request(dataSource.method??'get',dataSource.url??'', dataSource.params).then(res => {
                                item.options = res.data;
                            })
                        }
                    }
                })

            }
        })

       
        this.isInit = true;
        this.afterInitialization();
    }

    async getBtns(){
        await this.myApi.get('form/btns', {formId: this.menuCode}).then(res => {
            if (res.code === 200) {
                this.btns = res.data;
                this.btns = [...new Set(this.btns)]
            }
        })
    }
    afterInitialization() {

    }


    getDefaultValue(value: any|null) {
       if(value === null){
           return null;
       }
       if(value==="_UserId"){
           return this.myApi.userService.userId;
       }
       if(value==="_UserName"){
        return this.myApi.userService.nickName;
        }
        if(value==="_DateNow"){
            return this.myApi.dateFormat(new Date());
        }
        if(value==="_DateTimeNow"){
            return this.myApi.datetimeFormat(new Date());
        }
        return value;
    }
}