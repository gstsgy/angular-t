import { Directive, Input, TemplateRef } from "@angular/core";

@Directive({
    standalone: true,  // 添加这个标记
    selector: '[appSmartTemplate]',
    
  })
  export class SmartTemplateDirective {
    @Input('appSmartTemplate') id!: string;
    @Input() context?: any;
    
    constructor(public templateRef: TemplateRef<any>) {}
  }