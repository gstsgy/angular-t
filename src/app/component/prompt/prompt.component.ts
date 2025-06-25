import { Component,inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 导入 FormsModule
import {NzInputModule} from 'ng-zorro-antd/input';
import {  NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
@Component({
  selector: 'app-prompt',
  standalone: true,
  imports: [NzInputModule,FormsModule],
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.less'
})
export class PromptComponent {

  readonly placeholder: string = inject(NZ_MODAL_DATA);
  inputValue: string = ''; // 用户输入的值
}
