import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enApp from './locales/en-US/app.json';
import enCommon from './locales/en-US/common.json';
import zhApp from './locales/zh-CN/app.json';
import zhCommon from './locales/zh-CN/common.json';
import { KEY_PREFIX, LocalStorageKeys, LocalStorageStore } from '@dify-chat/helpers';
import { LangEnum } from '../constants';

i18n
	// 自动检测用户语言
	.use(LanguageDetector)
	// 集成React
	.use(initReactI18next)
	.init({
		// 如果没有缓存数据的语言，则使用浏览器语言
		// 从浏览器获取默认语言 匹配当前格式
		lng: LocalStorageStore.get(LocalStorageKeys.LANG) || navigator.language.replace('-', '_'),
		// 预加载资源
		resources: {
			'en_US': {
				common: enCommon,
				app: enApp,
			},
			'zh_CN': {
				common: zhCommon,
				app: zhApp,
			},
		},
		// 默认命名空间
		defaultNS: 'app',
		// React已经防止XSS
		interpolation: {
			escapeValue: false,
		},
		// 回退语言
		fallbackLng: LangEnum.EN_US,
		// 支持的语言列表
		supportedLngs: [LangEnum.EN_US, LangEnum.ZH_CN],
		// 语言检测配置
		detection: {
			// 检测顺序
			order: ['localStorage'],
			// 缓存位置
			caches: ['localStorage'],
			// localStorage键名
			lookupLocalStorage: KEY_PREFIX + LocalStorageKeys.LANG,
		},
	});

export default i18n;
