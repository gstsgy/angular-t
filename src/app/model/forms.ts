import {DetachedRouteHandle} from "@angular/router";

type FormType='input'|'number'|'password'|'switch'|'select'|'radio'|'date'|'time'|'datetime'|'treeSelect'|'diy';

interface FormsModel {
    code: string,
    type: FormType,
    label: string | null,
    value: any | null,
    required: boolean | null,
    isShow: boolean,
    disabled?: boolean | null,
    editable?: boolean | null,
    options?: Array<any>,
    optionModel?: string | null,
    width?: string | null,
    defaultValue?: any | null,
}

interface ResponseBean {
    code: number,

    message: string | null,

    data: any,
}

interface BtnModel {
    type: "primary" | "default" | "dashed" | "link" | "text" | null,

    name: string,

    code: string,

    icon?: string | null,

    disable?: boolean | null,
}

interface TabModel {
    menuCode:string,
    code: string,
    name: string,
    active?: boolean | null,
    handle?: DetachedRouteHandle | null,
}

interface DataSource {
    type: 'static'|'dict'|'api',
    code: string,
    dataSource?: any | null,
    url?: string | null,
    method?: 'get'|'post'|'put'|'delete'|'patch'|'head'|'options'|'connect'|'trace'|'get'|'post'|'put'|'delete',
    params?: any | null,

}

interface FormItem {
    code: string,
    label: string,
    name: string,
    type: string,
    value: any,
    required: boolean,
    disabled?: boolean | null,
    options?: Array<{ value: string | number, label: string }>,
    optionModel?: string | null,
}

export {FormsModel, BtnModel, ResponseBean, TabModel,DataSource};