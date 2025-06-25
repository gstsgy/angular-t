import { CanActivate,Router   } from "@angular/router";
import { inject } from '@angular/core';
import { UserService } from "@service/user.service";
 class LoginGuard implements CanActivate{
    private router:Router = inject(Router);
    private readonly userService: UserService = inject(UserService);
    canActivate(){
        if(!this.userService.token){
            this.router.navigate(['/login']);
        }
        return true;
    }
}

class DeFaultGuard implements CanActivate{
    private router:Router = inject(Router);
    private readonly userService: UserService = inject(UserService);
    canActivate(){
        if(!this.userService.token){
            this.router.navigate(['/login']);
        }else{
            this.router.navigate(['/home']);
        }
        return true;
    }
}
export {LoginGuard,DeFaultGuard}