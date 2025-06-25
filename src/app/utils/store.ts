import * as CryptoJS from 'crypto-js';
class MyLocalStore {
    private model:string;
    private secretKey:string;
    constructor(model:string) {
      this.model = model;
      this.secretKey = 'guyue123';
    }
    
  
    set(key:string, value:any) {
      
      const fullKey = this.getKey(key);
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), this.secretKey).toString();
      localStorage.setItem(fullKey, encrypted);
    }
  
    get(key:string) {
      const fullKey = this.getKey(key);
      const value = localStorage.getItem(fullKey);
      if(value){
        const bytes = CryptoJS.AES.decrypt(value, this.secretKey);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
      return null;
    }
  
    remove(key:string) {
      
      const fullKey = this.getKey(key);
      localStorage.removeItem(fullKey);
    }
  
    getKey(key:string) {
      return `${this.model}_${key}`;
    }

    clear() {
     
        const prefix = this.getKey('');
        for (let i = 0; i < localStorage.length; i++) {
          const key:string = localStorage.key(i)??'';
          if (key.startsWith(prefix)) {
            localStorage.removeItem(key);
          }
        }
      }
  }

  class MySessionStore {
    private model:string;
    private secretKey:string;
    constructor(model:string) {
      this.model = model;
      this.secretKey = 'guyue123.';
    }
  
    set(key:string, value:any) {
      if(typeof sessionStorage === 'undefined'){
        return ;
      }
      const fullKey = this.getKey(key);
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), this.secretKey).toString();
      sessionStorage.setItem(fullKey, encrypted);
    }
  
    get(key:string) {
      if(typeof sessionStorage === 'undefined'){
        return null;
      }
      const fullKey = this.getKey(key);
      const value = sessionStorage.getItem(fullKey);
      if(value){
        const bytes = CryptoJS.AES.decrypt(value, this.secretKey);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
      return null;
    }
  
    remove(key:string) {
      const fullKey = this.getKey(key);
      sessionStorage.removeItem(fullKey);
    }
  
    getKey(key:string) {
      return `${this.model}_${key}`;
    }

    clear() {

        const prefix = this.getKey('');
        for (let i = 0; i < sessionStorage.length; i++) {
          const key:string = sessionStorage.key(i)??'';
          if (key.startsWith(prefix)) {
            sessionStorage.removeItem(key);
          }
        }
      }
  }
  export {MyLocalStore, MySessionStore};