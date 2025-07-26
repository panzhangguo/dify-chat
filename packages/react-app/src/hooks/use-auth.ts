import { LocalStorageKeys, LocalStorageStore } from '@dify-chat/helpers'
import { useHistory } from 'pure-react-router'

/**
 * 授权 hook
 */
export const useAuth = () => {
	const history = useHistory()
	const userId = LocalStorageStore.get(LocalStorageKeys.USER_ID)
	const enableSetting = LocalStorageStore.get(LocalStorageKeys.ENABLE_SETTING)
	const enableAddApp = false

	/**
	 * 跳转登录页
	 */
	const goAuthorize = (redirect = '') => {
		history.push('/auth?redirect=' + redirect)
	}

	return {
		isAuthorized: !!userId,
		goAuthorize,
		userId,
		enableSetting,
		enableAddApp,
	}
}
