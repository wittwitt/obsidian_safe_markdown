import { moment } from 'obsidian';

// 支持的语言列表
export const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'zh-cn': '简体中文'
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// 检测系统语言
export function detectSystemLanguage(): SupportedLanguage {
  const systemLang = window.navigator.language.toLowerCase();

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

// 获取 Obsidian 当前语言
export function getObsidianLanguage(): SupportedLanguage {
  const obsidianLang = (window as any).app?.vault?.adapter?.fs?.promises ?
    moment.locale() : 'en';

  // 转换 Obsidian 语言代码到我们的语言代码
  const langMap: Record<string, SupportedLanguage> = {
    'zh-cn': 'zh-cn',
    'zh': 'zh-cn'
  };

  return langMap[obsidianLang] || 'en';
}
