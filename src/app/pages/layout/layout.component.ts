import {Component, ViewChild ,AfterViewInit, OnInit} from '@angular/core';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import { RouterOutlet} from '@angular/router';
import {MyHttpService} from '@service/my-http.service';
import {UserService} from '@service/user.service';
import {CommonModule} from '@angular/common';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {TabsComponent} from "@app/component/tabs/tabs.component";
import {TabModel} from "@model/forms";
import {MyApiService} from "@service/my-api.service";
import { NzModalModule,NzModalService } from 'ng-zorro-antd/modal';
@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [NzBreadCrumbModule, NzIconModule, NzMenuModule, NzLayoutModule, RouterOutlet, CommonModule, NzDropDownModule, TabsComponent],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.less'
})
export class LayoutComponent implements OnInit, AfterViewInit{
    @ViewChild(TabsComponent)
    tabs!: TabsComponent;

    constructor(private readonly httpClient: MyHttpService, public readonly userService: UserService,public myApi:MyApiService) {
    }

    ngOnInit() {
        this.httpClient.get('auth/menus?type=1').then((data: any) => {
            if (data.code == 200) {
                this.myApi.menus = data.data;
            }
        })
        this.httpClient.get('user/self').then((data: any) => {
            if (data.code == 200) {
                this.userService.nickName = data.data.nickName;
                this.userService.userId = data.data.id;
                this.userService.code = data.data.code;
            }
        })


    }

    logOut() {
        this.userService.clear();
        this.myApi.navigate('/login');
        this.myApi.cleanTabs();
    }

    go(it: any) {
        this.myApi.navigate(it.path);
        this.tabs.add({
            menuCode:it.id,
            code: it.path,
            name: it.name,
        })
    }


    moveMenu(e: TabModel) {
        this.myApi.navigate(e.code);
    }

    ngAfterViewInit(): void {
       // this.tabs.add()
    }

}
