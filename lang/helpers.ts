import { getLanguage } from 'obsidian';

// 支持的语言列表
export const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'zh': '简体中文'
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// 检测系统语言
export function detectSystemLanguage(): SupportedLanguage {
  // const systemLang = window.navigator.language.toLowerCase();
  const systemLang = getLanguage();

  // 精确匹配
  if (systemLang in SUPPORTED_LANGUAGES) {
    return systemLang as SupportedLanguage;
  }

  // 模糊匹配（如 zh-CN 匹配到 zh-cn）
  const langCode = systemLang.split('-')[0];
  for (const supportedLang of Object.keys(SUPPORTED_LANGUAGES)) {
    if (supportedLang.startsWith(langCode)) {
      return supportedLang as SupportedLanguage;
    }
  }

  // 默认返回英语
  return 'en';
}

