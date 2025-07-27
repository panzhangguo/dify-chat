import React, { useEffect, useState } from 'react';
import { LangEnum } from '../constants';
import { LocalStorageKeys, LocalStorageStore } from '@dify-chat/helpers';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
/**
 * 国际化上下文类型定义
 */
export interface ILangContext {
	/**
	 * 当前语言
	 */
	lang: LangEnum;
	/**
	 * 手动设置国际化模式
	 */
	setLang: (theme: LangEnum) => void;
}

/**
 * 国际化上下文
 */
export const LangContext = React.createContext<ILangContext>({
	lang: LangEnum.ZH_CN,
	setLang: () => {},
});

/**
 * 非中文模式的 body 类名
 */
export const LANG_CLASS_NAME = LangEnum.EN_US;

/**
 * 国际化上下文提供者
 */
export const LangContextProvider = (props: { children: React.ReactNode }) => {
	const { children } = props;
	const [lang, setLang] = useState<LangEnum>(() => {
		if (typeof window === 'undefined') {
			return LangEnum.ZH_CN;
		}

		return LocalStorageStore.get(LocalStorageKeys.LANG) || window.navigator.language;
	});

	useEffect(() => {
		// LocalStorageStore.set(LocalStorageKeys.LANG, lang);
		i18n.changeLanguage(lang);
		if (lang === LangEnum.EN_US) {
			document.body.classList.add(LANG_CLASS_NAME);
		} else if (lang === LangEnum.ZH_CN) {
			document.body.classList.remove(LANG_CLASS_NAME);
		}
	}, [lang]);

	return (
		<LangContext.Provider value={{ lang, setLang }}>
			{children}
		</LangContext.Provider>
	);
};

/**
 * 获取国际化上下文 hook
 */
export const useLangContext = () => {
	const context = React.useContext(LangContext);
	const { t } = useTranslation();
	return {
		...context,
		t,
	};
};
