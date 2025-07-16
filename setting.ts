import { App, Modal, Notice, Setting, PluginSettingTab } from 'obsidian';

import SafeMarkdownPlugin from './main';
import { GenRsaKeysContent } from './key'

//
import i18n from './lang/i18n';


export class KeyGenSettingTab extends PluginSettingTab {
  plugin: SafeMarkdownPlugin;

  constructor(app: App, plugin: SafeMarkdownPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    // containerEl.createEl('h2', { text: i18n.t('settings.title') });

    new Setting(containerEl)
      .setName(i18n.t('makekey.title'))
      .setDesc(createFragment((el) => {
        const ul = el.createEl('ol');
        ul.createEl('li', { text: i18n.t('makekey.l1') });
        ul.createEl('li', { text: i18n.t('makekey.l2') });
        ul.createEl('li', { text: i18n.t('makekey.l3') });
        ul.createEl('li', { text: i18n.t('makekey.l4') });
      }))
      .addButton((btn) =>
        btn.setButtonText(i18n.t('makekey.btnLabel')).onClick(async () => {
          const password = await this.promptForPassword();
          if (!password) return;

          const encrypted = GenRsaKeysContent(password);

          // 触发文件下载
          const timestamp = Math.floor(Date.now() / 1000);
          // this.downloadFile(`enc.${timestamp}.obsidian.meta`, encrypted);      
          const filename = `enc.${timestamp}.txt`;

          this.saveToExternalLocation(encrypted, filename);

          new Notice(i18n.t('makekey.okTip'));
        })
      );
  }

  async promptForPassword(): Promise<string | null> {
    return new Promise((resolve) => {
      const modal = new PasswordModal(this.app, resolve);
      modal.open();
    });
  }

  downloadFile2(filename: string, content: string) {
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async saveToExternalLocation(content: string, filename: string) {
    try {
      // 创建 Blob 对象
      const blob = new Blob([content], { type: 'text/plain' });

      // 检查是否支持 Web Share API
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: 'text/plain' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: i18n.t('makekey.downTip'),
            files: [file]
          });
          return;
        }
      }

      // 备用方案：创建下载链接
      this.downloadFile(blob, filename);

    } catch (error) {
      // console.error(i18n.t('makekey.downFailed'), error);
      new Notice(i18n.t('makekey.downFailed'));
    }
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.className = 'btnhide'
    // a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }

}

class PasswordModal extends Modal {
  callback: (password: string | null) => void;

  constructor(app: App, callback: (password: string | null) => void) {
    super(app);
    this.callback = callback;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h3', { text: i18n.t('makekey.passTip') });

    let password1 = '';
    let password2 = '';

    new Setting(contentEl)
      .setName(i18n.t('common.password'))
      .addText(text => {
        text.inputEl.type = "password";
        text
          .setPlaceholder(i18n.t('common.passTip'))
          .onChange(value => password1 = value.trim())
      });

    new Setting(contentEl)
      .setName(i18n.t('common.password2'))
      .addText(text => {
        text.inputEl.type = "password";
        text
          .setPlaceholder(i18n.t('common.pass2Tip'))
          .onChange(value => password2 = value.trim())
      });

    new Setting(contentEl)
      .addButton(button => button
        .setButtonText(i18n.t('common.enterBtn'))
        .onClick(() => {
          if (password1.length < 8) {
            new Notice("❌ " + i18n.t('common.pass8Tip'));
            return
          }
          if (password1 !== password2) {
            new Notice("❌ " + i18n.t('common.passeqTip'));
            return
          }
          const password = password1;
          this.close();
          this.callback(password || null);
        }));
  }

  onClose() {
    this.contentEl.empty();
  }
}
