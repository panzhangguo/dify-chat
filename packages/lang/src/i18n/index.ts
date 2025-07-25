import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enApp from './locales/en-US/app.json';
import enCommon from './locales/en-US/common.json';
import zhApp from './locales/zh-CN/app.json';
import zhCommon from './locales/zh-CN/common.json';
import { KEY_PREFIX, LocalStorageKeys } from '@dify-chat/helpers';
import { LangEnum } from '../constants';

const lng = LangEnum.ZH_CN;
i18n
	// 自动检测用户语言
	.use(LanguageDetector)
	// 集成React
	.use(initReactI18next)
	.init({
		// 预加载资源
		resources: {
			'en-US': {
				common: enCommon,
				app: enApp,
			},
			'zh-CN': {
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
		fallbackLng: lng,
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
