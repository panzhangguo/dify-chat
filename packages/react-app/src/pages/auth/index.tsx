import { Logo } from '@dify-chat/components'
import { LocalStorageKeys, LocalStorageStore } from '@dify-chat/helpers'
import FingerPrintJS from '@fingerprintjs/fingerprintjs'
import { useMount } from 'ahooks'
import { Spin } from 'antd'
import { useHistory, useSearchParams } from 'pure-react-router'

import { difyChatRuntimeConfig } from '@/config/global'
import { useAuth } from '@/hooks/use-auth'
import { useRedirect2Index } from '@/hooks/use-jump'

export default function AuthPage() {
	const { userId } = useAuth()
	const mode = difyChatRuntimeConfig.get().runningMode
	const redirect2Index = useRedirect2Index(mode)
	const params = useSearchParams()
	const history = useHistory()
	/**
	 * 模拟登录接口
	 */
	const mockLogin = async () => {
		const fp = await FingerPrintJS.load()
		const result = await fp.get()
		return {
			userId: result.visitorId,
			// 为方便演示，默认开启设置，实际场景中需要根据用户信息判断是否开启设置
			enableSetting: false,
		}
	}

	/**
	 * 登录函数
	 */
	const handleLogin = async () => {
		const userInfo = await mockLogin()
		LocalStorageStore.set(LocalStorageKeys.USER_ID, userInfo.userId)
		LocalStorageStore.set(LocalStorageKeys.ENABLE_SETTING, userInfo.enableSetting ? 'true' : '')
		redirect2Index()
	}

	const handleLoginRedirect = async (redirect = '') => {
		const userInfo = await mockLogin()
		LocalStorageStore.set(LocalStorageKeys.USER_ID, userInfo.userId)
		LocalStorageStore.set(LocalStorageKeys.ENABLE_SETTING, userInfo.enableSetting ? 'true' : '')
		history.replace(redirect)
	}

	useMount(() => {
		// 模拟自动登录
		const redirect = params.get('redirect')
		if (!userId) {
			if (redirect) {
				handleLoginRedirect(redirect)
			} else {
				handleLogin()
			}
		} else {
			if (redirect) {
				handleLoginRedirect(redirect)
			} else {
				redirect2Index()
			}
		}
	})

	return (
		<div className="w-screen h-screen flex flex-col items-center justify-center bg-theme-bg">
			<div className="absolute flex-col w-full h-full left-0 top-0 z-50 flex items-center justify-center">
				<Logo hideGithubIcon />
				<div className="text-theme-text">授权登录中...</div>
				<div className="mt-6">
					<Spin spinning />
				</div>
			</div>
		</div>
	)
}
