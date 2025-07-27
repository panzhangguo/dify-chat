import { DifyApi } from '@dify-chat/api'
import { AppModeEnums, DifyAppStore, type IDifyAppItem } from '@dify-chat/core'
import { LocalStorageKeys, LocalStorageStore } from '@dify-chat/helpers'

import { APP_LIST_KEY } from '@/constants'

/**
 * 应用列表 CRUD 的 localStorage 实现
 */
class DifyAppService extends DifyAppStore {
	public readonly = false as const

	getApps = async (): Promise<IDifyAppItem[]> => {
		// 修改 获取应用列表的逻辑
		// 从环境变量获取
		if (import.meta.env.PUBLIC_REQUEST_CONFIG) {
			const presetList = JSON.parse(import.meta.env.PUBLIC_REQUEST_CONFIG)
			// 如果没有userid的先生成一个
			const userId = LocalStorageStore.get(LocalStorageKeys.USER_ID)
			// 获取 Dify 应用信息
			if (!userId || presetList.length <= 0) {
				return []
			}
			const result = []
			for (const appIfo of presetList) {
				const newDifyApiInstance = new DifyApi({
					user: userId,
					apiBase: appIfo.apiBase,
					apiKey: appIfo.apiKey,
				})

				try {
					const difyAppInfo = await newDifyApiInstance.getAppInfo()
					const commonInfo: IDifyAppItem = {
						id: appIfo.id,
						info: {
							...difyAppInfo,
							// 兼容处理，当 Dify API 返回的应用信息中没有 mode 时，默认使用聊天机器人
							mode: difyAppInfo.mode || AppModeEnums.CHATBOT,
						},
						requestConfig: {
							apiBase: appIfo.apiBase,
							apiKey: appIfo.apiKey,
						},
						answerForm: {
							// 当工作流需要回复表单给用户填写时，建议开启此功能
							enabled: false,
							feedbackText: '',
						},
						inputParams: {
							enableUpdateAfterCvstStarts: false,
						},
						extConfig: {
							language: appIfo.language,
							conversation: {
								openingStatement: {
									displayMode: 'default',
								},
							},
						},
					}
					result.push(commonInfo)
				} catch (e) {
					console.error(e)
				}

			}
			return result || []
		} else {
			const appJson = localStorage.getItem(APP_LIST_KEY)
			return appJson ? JSON.parse(appJson) : []
		}
	}

	getApp = async (id: string): Promise<IDifyAppItem | undefined> => {
		const apps = await this.getApps()
		return apps.find(config => config.id === id)
	}

	addApp = async (config: IDifyAppItem): Promise<void> => {
		const apps = await this.getApps()
		apps.push(config)
		localStorage.setItem(APP_LIST_KEY, JSON.stringify(apps))
	}

	updateApp = async (config: IDifyAppItem): Promise<void> => {
		const apps = await this.getApps()
		const index = apps.findIndex(c => c.id === config.id)
		if (index !== -1) {
			apps[index] = config
			localStorage.setItem(APP_LIST_KEY, JSON.stringify(apps))
		}
	}

	deleteApp = async (id: string): Promise<void> => {
		const apps = await this.getApps()
		const newApps = apps.filter(config => config.id !== id)
		localStorage.setItem(APP_LIST_KEY, JSON.stringify(newApps))
	}
}

export default DifyAppService
