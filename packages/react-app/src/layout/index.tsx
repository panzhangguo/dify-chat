import { IDifyAppExtendRequestConfig } from '@dify-chat/core'
import { useLangContext } from '@dify-chat/lang'
import { Route, useHistory, useParams } from 'pure-react-router'
import { useEffect } from 'react'

import { difyChatRuntimeConfig } from '@/config/global'
import { useAuth } from '@/hooks/use-auth'
import { useRedirect2Index } from '@/hooks/use-jump'

/**
 * 处理路由的布局容器
 */
export default function LayoutIndex() {
	const history = useHistory()
	const mode = difyChatRuntimeConfig.get().runningMode
	const { isAuthorized, goAuthorize } = useAuth()
	const redirect2Index = useRedirect2Index(mode)
	const { lang } = useLangContext()
	const { appId } = useParams<{ appId: string }>()

	useEffect(() => {
		const pathname = history.location.pathname

		// 如果未登录，则跳转登录
		if (!isAuthorized && pathname !== '/auth') {
			if (appId) {
				goAuthorize('/app/' + appId)
			} else {
				if (import.meta.env.PUBLIC_REQUEST_CONFIG) {
					const configs = JSON.parse(
						import.meta.env.PUBLIC_REQUEST_CONFIG,
					) as IDifyAppExtendRequestConfig[]
					const currentConfig = configs.find(item => item.language === lang)
					goAuthorize('/app/' + currentConfig?.id)
					return
				} else {
					redirect2Index()
				}
			}
			return
		}

		if (pathname === '' || pathname === '/') {
			if (import.meta.env.PUBLIC_REQUEST_CONFIG) {
				const configs = JSON.parse(
					import.meta.env.PUBLIC_REQUEST_CONFIG,
				) as IDifyAppExtendRequestConfig[]
				const currentConfig = configs.find(item => item.language === lang)
				goAuthorize('/app/' + currentConfig?.id)
				return
			} else {
				redirect2Index()
			}
		}
	}, [history.location.pathname, mode, isAuthorized, lang])

	return <Route />
}
