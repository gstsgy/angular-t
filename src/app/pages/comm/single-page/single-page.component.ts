import {Component} from '@angular/core';
import {MyApiService} from "@service/my-api.service";
import {ActivatedRoute} from "@angular/router";
import {FormsComponent} from "@app/component/forms/forms.component";
import {BtnsComponent} from "@app/component/btns/btns.component";
import {GridsComponent} from "@app/component/grids/grids.component";
import SingelSetFormModel from "@model/singelSetFormModel";

@Component({
    selector: 'app-set-form',
    standalone: true,
    imports: [
        BtnsComponent,
        FormsComponent,
        GridsComponent
    ],
    templateUrl: './set-form.component.html',
    styleUrl: './set-form.component.less'
})
export class SetFormComponent extends SingelSetFormModel {


    constructor(public override myApi: MyApiService, public override route: ActivatedRoute) {
        super(myApi,route);

    }
}
