import {
	EditOutlined,
	MenuOutlined,
	MinusCircleOutlined,
	PlusCircleOutlined,
	PlusOutlined,
	SmileOutlined,
} from '@ant-design/icons'
import { DifyApi, IConversationItem } from '@dify-chat/api'
import { AppIcon, AppInfo, ConversationList, LucideIcon } from '@dify-chat/components'
import { HeaderLayout } from '@dify-chat/components'
import { ConversationsContextProvider, IDifyAppItem, useAppContext } from '@dify-chat/core'
import { generateUuidV4, isTempId, useIsMobile } from '@dify-chat/helpers'
import { LangEnum, useLangContext } from '@dify-chat/lang'
import { ThemeModeEnum, useThemeContext } from '@dify-chat/theme'
import {
	Button,
	Divider,
	Dropdown,
	Empty,
	Form,
	GetProp,
	Input,
	message,
	Modal,
	Popover,
	Radio,
	Spin,
	Tooltip,
} from 'antd'
import dayjs from 'dayjs'
import { useSearchParams } from 'pure-react-router'
import React, { useEffect, useMemo, useState } from 'react'

import ChatboxWrapper from '@/components/chatbox-wrapper'
// import { DEFAULT_CONVERSATION_NAME } from '@/constants'
import { useLatest } from '@/hooks/use-latest'

interface IChatLayoutProps {
	/**
	 * 扩展的 JSX 元素, 如抽屉/弹窗等
	 */
	extComponents?: React.ReactNode
	/**
	 * 自定义中心标题
	 */
	renderCenterTitle?: (appInfo?: IDifyAppItem['info']) => React.ReactNode
	/**
	 * 自定义右侧头部内容
	 */
	renderRightHeader?: () => React.ReactNode
	/**
	 * 是否正在加载应用配置
	 */
	initLoading: boolean
	/**
	 * Dify API 实例
	 */
	difyApi: DifyApi
}

export default function ChatLayout(props: IChatLayoutProps) {
	// renderCenterTitle
	const { extComponents, initLoading, difyApi } = props
	const [sidebarOpen, setSidebarOpen] = useState(true)
	const { themeMode, setThemeMode } = useThemeContext()
	const { t, lang, setLang } = useLangContext()
	const { appLoading, currentApp } = useAppContext()
	const [renameForm] = Form.useForm()
	const [conversations, setConversations] = useState<IConversationItem[]>([])
	const [currentConversationId, setCurrentConversationId] = useState<string>('')
	const currentConversationInfo = useMemo(() => {
		return conversations.find(item => item.id === currentConversationId)
	}, [conversations, currentConversationId])
	const isMobile = useIsMobile()
	// 创建 Dify API 实例
	const searchParams = useSearchParams()
	const [conversationListLoading, setCoversationListLoading] = useState<boolean>(false)
	const latestCurrentConversationId = useLatest(currentConversationId)

	useEffect(() => {
		if (!currentApp?.config) {
			return
		}
		setConversations([])
		setCurrentConversationId('')
		getConversationItems().then(() => {
			const isNewConversation = searchParams.get('isNewCvst') === '1'
			if (isNewConversation) {
				onAddConversation()
			}
		})
	}, [currentApp?.config])

	/**
	 * 获取对话列表
	 */
	const getConversationItems = async (showLoading = true) => {
		if (showLoading) {
			setCoversationListLoading(true)
		}
		try {
			const result = await difyApi?.getConversationList()
			const newItems =
				result?.data?.map(item => {
					return {
						key: item.id,
						label: item.name,
					}
				}) || []
			setConversations(result?.data)
			// 避免闭包问题
			if (!latestCurrentConversationId.current) {
				if (newItems.length) {
					setCurrentConversationId(newItems[0]?.key)
				} else {
					onAddConversation()
				}
			}
		} catch (error) {
			console.error(error)
			message.error(`${t('conversation.fetch_failed')}: ${error}`)
		} finally {
			setCoversationListLoading(false)
		}
	}

	/**
	 * 添加临时新对话(要到第一次服务器响应有效的对话 ID 时才真正地创建完成)
	 */
	const onAddConversation = () => {
		// 创建新对话
		const newKey = `temp_${generateUuidV4()}`
		// 使用函数式更新保证状态一致性（修复潜在竞态条件）
		setConversations(prev => {
			return [
				{
					id: newKey,
					name: t('conversation.default_name'),
					created_at: dayjs().valueOf(),
					inputs: {},
					introduction: '',
					status: 'normal',
					updated_at: dayjs().valueOf(),
				},
				...(prev || []),
			]
		})
		setCurrentConversationId(newKey)
	}

	/**
	 * 重命名对话
	 */
	const onRenameConversation = async (conversationId: string, name: string) => {
		await difyApi?.renameConversation({
			conversation_id: conversationId,
			name,
		})
		getConversationItems()
	}

	/**
	 * 重命名会话
	 * @param conversation 会话对象
	 */
	const handleRenameConversation = () => {
		renameForm.setFieldsValue({
			name: currentConversationInfo?.name,
		})
		Modal.confirm({
			centered: true,
			destroyOnClose: true,
			title: t('conversation.edit'),
			content: (
				<Form
					form={renameForm}
					className="mt-3"
				>
					<Form.Item name="name">
						<Input placeholder="请输入" />
					</Form.Item>
				</Form>
			),
			onOk: async () => {
				await renameForm.validateFields()
				const values = await renameForm.validateFields()
				await onRenameConversation(currentConversationId, values.name)
				message.success(`${t('conversation.rename_success')}`)
			},
		})
	}

	/**
	 * 删除对话
	 */
	const onDeleteConversation = async (conversationId: string) => {
		if (isTempId(conversationId)) {
			setConversations(prev => {
				const newConversations = prev.filter(item => item.id !== conversationId)
				// 删除当前对话
				if (conversationId === currentConversationId) {
					// 如果列表不为空，则选择第一个作为当前对话
					if (newConversations.length) {
						setCurrentConversationId(newConversations[0].id)
					} else {
						// 如果列表为空，则创建一个新的临时对话
						onAddConversation()
					}
				}
				return newConversations
			})
		} else {
			await difyApi?.deleteConversation(conversationId)
			if (conversationId === currentConversationId) {
				setCurrentConversationId('')
			}
			getConversationItems()
			return Promise.resolve()
		}
	}

	const mobileMenuItems: GetProp<typeof Dropdown, 'menu'>['items'] = useMemo(() => {
		const actionMenus: GetProp<typeof Dropdown, 'menu'>['items'] = [
			{
				key: 'add_conversation',
				icon: <PlusCircleOutlined />,
				label: t('conversation.add'),
				disabled: isTempId(currentConversationId),
				onClick: () => {
					onAddConversation()
				},
			},
			{
				key: 'rename_conversation',
				icon: <EditOutlined />,
				label: t('conversation.edit'),
				disabled: isTempId(currentConversationId),
				onClick: () => {
					handleRenameConversation()
				},
			},
			{
				key: 'delete_conversation',
				icon: <MinusCircleOutlined />,
				label: t('conversation.delete'),
				disabled: isTempId(currentConversationId),
				danger: true,
				onClick: () => {
					Modal.confirm({
						centered: true,
						title: t('conversation.delete_confirm'),
						content: t('conversation.delete_confirm_content'),
						okText: t('common.confirm'),
						cancelText: t('common.cancel'),
						onOk: async () => {
							// 执行删除操作
							await onDeleteConversation(currentConversationId)
							message.success(t('common.delete_success'))
						},
					})
				},
			},
			{
				type: 'divider',
			},
		]

		const conversationListMenus: GetProp<typeof Dropdown, 'menu'>['items'] = [
			{
				key: 'view-mode',
				type: 'group',
				children: [
					{
						key: 'light',
						label: (
							<Radio.Group
								key="view-mode"
								optionType="button"
								value={themeMode}
								onChange={e => {
									setThemeMode(e.target.value as ThemeModeEnum)
								}}
							>
								<Radio value={ThemeModeEnum.SYSTEM}>{t('theme.system')}</Radio>
								<Radio value={ThemeModeEnum.LIGHT}>{t('theme.light')}</Radio>
								<Radio value={ThemeModeEnum.DARK}>{t('theme.dark')}</Radio>
							</Radio.Group>
						),
					},
				],
				label: t('common.theme'),
			},
			{
				type: 'divider',
			},
			{
				type: 'group',
				key: 'language',
				children: [
					{
						key: 'language',
						label: (
							<Radio.Group
								key="language"
								optionType="button"
								value={lang}
								onChange={e => {
									setLang(e.target.value as LangEnum)
								}}
							>
								<Radio value={LangEnum.ZH_CN}>{t('中文')}</Radio>
								<Radio value={LangEnum.EN_US}>{t('language.en_US')}</Radio>
							</Radio.Group>
						),
					},
				],
				label: t('language.title'),
			},
			{
				type: 'divider',
			},
			{
				type: 'group',
				label: t('conversation.list'),
				children: conversations?.length
					? conversations.map(item => {
							return {
								key: item.id,
								label: item.name,
								onClick: () => {
									setCurrentConversationId(item.id)
								},
							}
						})
					: [
							{
								key: 'no_conversation',
								label: t('conversation.no_list'),
								disabled: true,
							},
						],
			},
		]

		if (isTempId(currentConversationId)) {
			return [...conversationListMenus]
		}

		return [...actionMenus, ...conversationListMenus]
	}, [currentConversationId, conversations, themeMode, setThemeMode, t])

	// 对话列表（包括加载和缺省状态）
	const conversationListWithEmpty = useMemo(() => {
		return (
			<Spin spinning={conversationListLoading}>
				{conversations?.length ? (
					<ConversationList
						renameConversationPromise={onRenameConversation}
						deleteConversationPromise={onDeleteConversation}
						items={conversations.map(item => {
							return {
								key: item.id,
								label: item.name,
								icon: <SmileOutlined />,
							}
						})}
						activeKey={currentConversationId}
						onActiveChange={id => {
							setCurrentConversationId(id)
						}}
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<Empty
							className="pt-6"
							description={t('conversation.no_list')}
						/>
					</div>
				)}
			</Spin>
		)
	}, [conversations, onRenameConversation, onDeleteConversation, setCurrentConversationId])

	return (
		<ConversationsContextProvider
			value={{
				conversations,
				setConversations,
				currentConversationId,
				setCurrentConversationId,
				currentConversationInfo,
			}}
		>
			<div className={`w-full h-screen flex flex-col overflow-hidden bg-theme-bg`}>
				{/* 头部 */}
				<HeaderLayout
					// title={renderCenterTitle?.(currentApp?.config?.info)}
					className="!h-12"
					rightIcon={
						isMobile ? (
							<Dropdown
								menu={{
									className: '!pb-3 w-[80vw]',
									activeKey: currentConversationId,
									items: mobileMenuItems,
								}}
							>
								<MenuOutlined className="text-xl" />
							</Dropdown>
						) : null
					}
				/>
				{/* Main */}
				<div className="flex-1 overflow-hidden flex rounded-t-3xl bg-theme-main-bg">
					{appLoading || initLoading ? (
						<div className="absolute w-full h-full left-0 top-0 z-50 flex items-center justify-center">
							<Spin spinning />
						</div>
					) : currentApp?.config ? (
						<>
							{/* 左侧对话列表 */}
							<div
								className={`hidden md:!flex ${sidebarOpen ? 'w-72' : 'w-14'} transition-all h-full flex-col border-0 border-r border-solid border-r-theme-splitter`}
							>
								{sidebarOpen ? (
									<>
										{currentApp.config.info ? <AppInfo /> : null}
										{/* 添加会话 */}
										{currentApp ? (
											<>
												<Button
													onClick={() => {
														onAddConversation()
													}}
													color="primary"
													variant="filled"
													className="h-10 leading-10 rounded-lg border border-solid border-gray-200 mt-3 mx-4 text-theme-text "
													icon={<PlusOutlined className="" />}
												>
													{t('conversation.add')}
												</Button>
												<Divider orientation="left"></Divider>
												<div className="text-theme-desc text-[0.75rem] pb-3 pl-4">
													{t('conversation.history')}
												</div>
											</>
										) : null}
										{/* 🌟 对话管理 */}
										<div className="px-4 flex-1 overflow-auto">{conversationListWithEmpty}</div>
									</>
								) : (
									<div className="flex flex-col justify-start items-center flex-1 pt-6">
										{/* 应用图标 */}
										<div className="mb-1.5 flex items-center justify-center">
											<AppIcon size="small" />
										</div>

										{/* 新增对话 */}
										<Tooltip
											title={t('conversation.add')}
											placement="right"
										>
											<div className="text-theme-text my-1.5 hover:text-primary flex items-center">
												<LucideIcon
													name="plus-circle"
													strokeWidth={1.25}
													size={28}
													className="cursor-pointer"
													onClick={() => {
														onAddConversation()
													}}
												/>
											</div>
										</Tooltip>

										<Popover
											content={
												<div className="max-h-[50vh] overflow-auto pr-3">
													{conversationListWithEmpty}
												</div>
											}
											title={t('conversation.history')}
											placement="rightTop"
										>
											{/* 必须包裹一个 HTML 标签才能正常展示 Popover */}
											<div className="flex items-center justify-center">
												<LucideIcon
													className="my-1.5 cursor-pointer hover:text-primary"
													strokeWidth={1.25}
													size={28}
													name="menu"
												/>
											</div>
										</Popover>
									</div>
								)}

								<div className="border-0 border-t border-solid border-theme-splitter flex items-center justify-center h-12">
									<Tooltip
										title={sidebarOpen ? t('common.sidebar_collapse') : t('common.sidebar_expand')}
										placement="right"
									>
										<div className="flex items-center justify-center">
											<LucideIcon
												onClick={() => {
													setSidebarOpen(!sidebarOpen)
												}}
												name={sidebarOpen ? 'panel-left-close' : 'panel-left-close'}
												className="cursor-pointer hover:text-primary"
												strokeWidth={1.25}
												size={28}
											/>
										</div>
									</Tooltip>
								</div>
							</div>

							{/* 右侧聊天窗口 - 移动端全屏 */}
							<div className="flex-1 min-w-0 flex flex-col overflow-hidden">
								<ChatboxWrapper
									difyApi={difyApi}
									conversationListLoading={conversationListLoading}
									onAddConversation={onAddConversation}
									conversationItemsChangeCallback={() => getConversationItems(false)}
								/>
							</div>
						</>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<Empty
								description={t('common.empty_app_description')}
								className="text-base"
							/>
						</div>
					)}
				</div>
			</div>

			{extComponents}
		</ConversationsContextProvider>
	)
}
