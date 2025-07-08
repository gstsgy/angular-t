import { Component, AfterViewInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import * as ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/theme-chrome';
import 'ace-builds/src-noconflict/ext-language_tools';
@Component({
  selector: 'app-ace-editor',
  standalone: true,
  imports: [],
  templateUrl: './ace-editor.component.html',
  styleUrl: './ace-editor.component.less'
})
export class AccEditorComponent implements AfterViewInit{

  @ViewChild('editor') private editorElement!: ElementRef<HTMLElement>;
  private editor!: ace.Ace.Editor;
  @Input() content: string = '';
  @Output() contentChange = new EventEmitter<string>();

  ngAfterViewInit(): void {
    ace.config.set('basePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.32.0/src-noconflict/');
    
    this.editor = ace.edit(this.editorElement.nativeElement);
    this.editor.setTheme('ace/theme/chrome');
    this.editor.session.setMode('ace/mode/xml');
    this.editor.session.setValue(this.content);
    this.editor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      fontSize: '14px',
      showPrintMargin: false,
      highlightActiveLine: true,
      useWorker: true
    });

    // 监听内容变化
    this.editor.session.on('change', () => {
      const content = this.editor.getValue();
      this.contentChange.emit(content);
    });
  }

  public getValue(): string {
    return this.editor?.getValue() || '';
  }

  public setValue(content: string): void {
    if (this.editor) {
      this.editor.setValue(content, -1); // -1 保持光标位置
    }
  }

  public formatXml(): void {
    if (!this.editor) return;
    
    try {
      const formatted = this.formatXmlString(this.editor.getValue());
      this.editor.setValue(formatted, -1);
    } catch (e) {
      console.error('XML 格式化失败:', e);
    }
  }

  private formatXmlString(xml: string): string {
    // 简单格式化实现
    let formatted = '';
    let indent = '';
    const tab = '    ';
    let inTag = false;
    
    xml = xml.replace(/>\s+</g, '><').trim();
    
    for (let i = 0; i < xml.length; i++) {
      const char = xml[i];
      
      if (char === '<') {
        if (xml[i+1] === '/') {
          indent = indent.substring(tab.length);
          formatted += '\n' + indent;
        } else {
          formatted += '\n' + indent;
        }
        inTag = true;
      }
      
      formatted += char;
      
      if (char === '>') {
        inTag = false;
        if (xml[i-1] !== '/' && xml[i+1] !== '<' && xml[i+1] !== '/') {
          indent += tab;
        }
      }
    }
    
    return formatted.trim();
  }
}
