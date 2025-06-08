import { Plugin, Notice } from 'obsidian';

import i18n from './lang/i18n';

export default class MyPlugin extends Plugin {
  async saveToExternalLocation(content: string, filename: string) {
    try {
      // 创建 Blob 对象
      const blob = new Blob([content], { type: 'text/plain' });

      // 检查是否支持 Web Share API
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: 'text/plain' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: i18n.t('share.tip1'),
            files: [file]
          });
          return;
        }
      }

      // 备用方案：创建下载链接
      this.downloadFile(blob, filename);

    } catch (error) {
      console.error(i18n.t('share.tip2'), error);
      new Notice(i18n.t('share.tip3'));
    }
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }
}