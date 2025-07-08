import { Component, ViewChild } from '@angular/core';
import { AccEditorComponent } from '@app/component/ace-editor/ace-editor.component';
@Component({
  selector: 'app-test',
  standalone: true,
  imports: [AccEditorComponent],
  templateUrl: './test.component.html',
  styleUrl: './test.component.less'
})
export class TestComponent {
  xmlContent = `<root>
  <person id="1">
      <name>张三</name>
      <age>30</age>
  </person>
</root>`;

error: string | null = null;

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
    alert('XML 有效！');
  } catch (e: any) {
    this.error = `XML 验证失败: ${e.message}`;
  }
}
}
