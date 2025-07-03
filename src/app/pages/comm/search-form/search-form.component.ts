import {Component, AfterViewInit} from '@angular/core';
import {MyApiService} from "@service/my-api.service";
import {ActivatedRoute} from "@angular/router";
import {FormsComponent} from "@app/component/forms/forms.component";
import {BtnsComponent} from "@app/component/btns/btns.component";
import {GridsComponent} from "@app/component/grids/grids.component";
import SearchFormModel from "@model/searchFormModel";
import { NzSpinModule } from 'ng-zorro-antd/spin';
@Component({
    selector: 'app-search-form',
    standalone: true,
    imports: [FormsComponent, BtnsComponent, GridsComponent,NzSpinModule],
    templateUrl: './search-form.component.html',
    styleUrl: './search-form.component.less'
})
export class SearchFormComponent extends SearchFormModel  {
    constructor(public override myApi: MyApiService,public override route:ActivatedRoute) {
        super(myApi,route);
    }

   
}
