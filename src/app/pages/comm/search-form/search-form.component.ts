import {Component} from '@angular/core';
import {MyApiService} from "@service/my-api.service";
import {ActivatedRoute} from "@angular/router";
import {FormReportComponent} from "@app/component/form-report/form-report.component";
import SearchFormModel from "@model/searchFormModel";
@Component({
    selector: 'app-search-form',
    standalone: true,
    imports: [FormReportComponent],
    templateUrl: './search-form.component.html',
    styleUrl: './search-form.component.less'
})
export class SearchFormComponent extends SearchFormModel  {
    constructor(public override myApi: MyApiService,public override route:ActivatedRoute) {
        super(myApi,route);
    }

   
}
