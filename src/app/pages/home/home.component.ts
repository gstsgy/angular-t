import { Component,inject } from '@angular/core';
import { MyHttpService } from '@service/my-http.service';
import { MyApiService } from '@service/my-api.service';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NzIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.less'
})
export class HomeComponent {
     constructor(
      private readonly httpClient: MyHttpService,
      private readonly myApi: MyApiService
     ) {}
     
     title:string='';
     menuCount: number = 0;
     userCount: number = 128;
     version: string = 'v1.2.0';
     
    ngOnInit() { 
      this.title = '首页';
      this.menuCount = this.myApi.menus.length;
    }
    
    goToPage(path: string) {
      this.myApi.navigate(path);
    }
}
