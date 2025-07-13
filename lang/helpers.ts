import { getLanguage } from 'obsidian';

// 支持的语言列表（动态对象，非只读）
export const SUPPORTED_LANGUAGES: { [key: string]: string } = {
  en: 'English',
  zh: '简体中文',
};

// 类型定义为 string
export type SupportedLanguage = string;

// 检测系统语言
export function detectSystemLanguage(): SupportedLanguage {
  const systemLang = getLanguage();

  // 精确匹配
  if (systemLang in SUPPORTED_LANGUAGES) {
    return systemLang;
  }

  // 模糊匹配（如 zh-CN 匹配到 zh）
  const langCode = systemLang.split('-')[0];
  for (const supportedLang of Object.keys(SUPPORTED_LANGUAGES)) {
    if (supportedLang.startsWith(langCode)) {
      return supportedLang;
    }
  }

  // 默认返回英语
  return 'en';
}