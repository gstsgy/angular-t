import {Component} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators,FormsModule} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzIconModule} from 'ng-zorro-antd/icon';
import { MyHttpService } from '@service/my-http.service';
import { UserService } from '@service/user.service';
import { Router } from '@angular/router';
import { MySessionStore } from '@utils/store';
@Component({
    selector: 'app-login',
    standalone: true,
    imports: [NzButtonModule, NzCheckboxModule, NzFormModule, NzInputModule, ReactiveFormsModule,NzIconModule,FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.less'
})
export class LoginComponent {
    constructor(private fb: NonNullableFormBuilder,private readonly httpClient: MyHttpService,private readonly userService: UserService,private router:Router) {
    }
    //checked = false;
    store:MySessionStore = new MySessionStore('login');
    validateForm  = this.fb.group({
        code: this.fb.control(this.store.get('code') , [Validators.required]),
        passwd: this.fb.control(this.store.get('passwd') , [Validators.required]),
        checked: this.fb.control(this.store.get('checked'),[])
    });

    submitForm(): void {
        if(!this.validateForm.valid){
            Object.values(this.validateForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({onlySelf: true});
                }
            });
            return;
        }
        this.httpClient.post('auth/login',this.validateForm.value).then((data:any)=>{
            if(data.code == 200){
                if(this.validateForm.value.checked){
                    this.store.set('code',this.validateForm.value.code);
                    this.store.set('passwd',this.validateForm.value.passwd);
                    this.store.set('checked',this.validateForm.value.checked);
                }
               
                this.userService.token =  data.data;
                this.router.navigate(['/home']);
            }
           
        })
    }

    ngOnInit(){
        //this.checked = this.store.get('checked') || false;
    }
}
