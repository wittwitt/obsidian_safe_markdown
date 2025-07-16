import en from './locate/en';
import zhCn from './locate/zh-cn';

import { SupportedLanguage, detectSystemLanguage, SUPPORTED_LANGUAGES } from './helpers';

// type TranslationKey = keyof typeof en;

type NestedTranslationKey<T> = T extends object
  ? { [K in keyof T]: T[K] extends object
    ? `${string & K}.${string & NestedTranslationKey<T[K]>}`
    : string & K
  }[keyof T]
  : never;

export type I18nKey = NestedTranslationKey<typeof en>;

export class I18n {
  private currentLanguage: SupportedLanguage = 'en';
  private translations: Record<SupportedLanguage, any> = {
    'en': en,
    'zh': zhCn
  };

  constructor(language?: SupportedLanguage) {
    this.currentLanguage = language || detectSystemLanguage();
  }

  // 设置当前语言
  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage = language;
  }

  // 获取当前语言
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  // 翻译函数
  t(key: I18nKey, params?: Record<string, string | number>): string {
    const translation = this.getNestedValue(
      this.translations[this.currentLanguage] || this.translations['en'],
      key
    );

    if (typeof translation !== 'string') {
      // console.warn(`Translation not found for key: ${key}`);
      return key;
    }

    // 处理参数替换
    if (params) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  // 获取嵌套对象的值
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // 参数插值
  private interpolate(template: string, params: Record<string, string | number>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  // 获取所有支持的语言
  getSupportedLanguages(): typeof SUPPORTED_LANGUAGES {
    return SUPPORTED_LANGUAGES;
  }
}

const i18n = new I18n();
export default i18n;