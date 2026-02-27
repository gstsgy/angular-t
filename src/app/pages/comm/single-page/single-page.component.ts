import {Component} from '@angular/core';
import {MyApiService} from "@service/my-api.service";
import {ActivatedRoute} from "@angular/router";
import {FormReportComponent} from "@app/component/form-report/form-report.component";
import SingelPageModel from "@model/singelPageModel";
import { FormsVerticalComponent } from "@app/component/forms-vertical/forms-vertical.component";
@Component({
    selector: 'app-set-form',
    standalone: true,
    imports: [
        FormReportComponent,
        FormsVerticalComponent
    ],
    templateUrl: './single-page.component.html',
    styleUrl: './single-page.component.less'
})
export class SetFormComponent extends SingelPageModel {

    constructor(public override myApi: MyApiService, public override route: ActivatedRoute) {
        super(myApi,route);

    }
}
