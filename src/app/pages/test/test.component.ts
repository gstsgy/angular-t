import { Component, ViewChild } from "@angular/core";
import { AccEditorComponent } from "@app/component/ace-editor/ace-editor.component";
import { FormsVerticalComponent } from "@app/component/forms-vertical/forms-vertical.component";
import { FormsModel } from "@app/model/forms";
import BaseForm from "@model/base-form";
import { MyApiService } from "@service/my-api.service";
import { NzModalRef } from "ng-zorro-antd/modal";
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzQRCodeModule } from 'ng-zorro-antd/qr-code';
@Component({
  selector: "app-test",
  standalone: true,
  imports: [AccEditorComponent, FormsVerticalComponent,NzUploadModule,NzQRCodeModule],
  templateUrl: "./test.component.html",
  styleUrl: "./test.component.less",
})
export class TestComponent extends BaseForm {
  constructor(public override myApi: MyApiService) {
    super(myApi);
    this.formId = "1865028517959344129";
    this.parse();
  }
  xmlContent = `<root>
    <person id="1">
        <name>张三</name>
        <age>30</age>
    </person>
  </root>`;

  error: string | null = null;
  uploading = false;
  fileList: NzUploadFile[] = [];
  qr:string='';
  @ViewChild(AccEditorComponent) editor!: AccEditorComponent;

  formatXml(): void {
    this.editor.formatXml();
  }

  validateXml(): void {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(this.xmlContent, "text/xml");

      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        //throw new Error(xmlDoc.getElementsByTagName("parsererror")[0].textContent);
      }

      this.error = null;
      alert("XML 有效！");
    } catch (e: any) {
      this.error = `XML 验证失败: ${e.message}`;
    }
  }
  editor1() {
    const model:NzModalRef<FormsVerticalComponent> = this.myApi.modal.create<FormsVerticalComponent>({
      nzTitle: "新增表单",
      nzContent: FormsVerticalComponent,
      nzWidth: "640px",
      nzOnOk: (componentInstance) => {
        //this.xmlContent = componentInstance.xmlContent;
      },
    })
    if(model.componentInstance){
      model.componentInstance.formCol = this.formCols;
    }
    
  }
  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };
  handleUpload(): void {
    const formData = new FormData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.fileList.forEach((file: any) => {
      formData.append('file', file);
    });
    this.uploading = true;
    this.myApi.post('file/upload',formData)
    // You can use any AJAX library you like
  }
  down(){
    this.myApi.down(`file/download?id=1978835568335884289`)
  }

  getQr(){
    this.myApi.get('user/qr').then(res=>{
      this.qr=res.data;
    })
  }

  getQr1(){
    this.myApi.showPrompt("请输入code").then(res=>{
      this.myApi.get('user/qr1?secret=5D2RSMSL25UGFOH6&code='+res).then(res=>{
        this.qr=res.data;
      })
    })
  }
}
