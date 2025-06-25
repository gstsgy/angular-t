import { Injectable } from '@angular/core';
import { MySessionStore } from '@utils/store';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  token: string;
  code: string;
  nickName: string;
  store: MySessionStore;
  userId:string;
  constructor() {
    this.token = '';
    this.code = '';
    this.nickName = '';
    this.userId = '';
    this.store = new MySessionStore('user');
    this.init();
   }
   
   private init() {
      Object.defineProperties(this,{
        token:{
          get:()=>{
            return this.store.get('token');
          },
          set:(value)=>{
            this.store.set('token',value);
          }
        },
        code:{
          get:()=>{
            return this.store.get('code');
          },
          set:(value)=>{
            this.store.set('code',value);
          }
        },
        nickName:{
          get:()=>{
            return this.store.get('nickName');
          },
          set:(value)=>{
            this.store.set('nickName',value);
          }
        },
        userId:{
          get:()=>{
            return this.store.get('userId');
          },
          set:(value)=>{
            this.store.set('userId',value);
          }
        }
      });
   }
  
   public clear() {
    this.store.clear();
  }
}
