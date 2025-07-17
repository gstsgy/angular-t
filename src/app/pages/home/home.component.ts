import { Component,inject } from '@angular/core';
import { MyHttpService } from '@service/my-http.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.less'
})
export class HomeComponent {
     constructor(private readonly httpClient: MyHttpService) {}
     title:string='';
     //private readonly httpClient = inject(HttpClient);
    ngOnInit() { 
      this.title = 'Home';
      // this.httpClient.get('/todos/1').then((data:any)=>{
      // })
    }
}
