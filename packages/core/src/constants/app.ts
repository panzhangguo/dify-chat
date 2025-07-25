/**
 * 应用类型
 */
export enum AppModeEnums {
	/**
	 * 文本生成
	 */
	TEXT_GENERATOR = 'completion',
	/**
	 * 聊天助手
	 */
	CHATBOT = 'chat',
	/**
	 * 工作流
	 */
	WORKFLOW = 'workflow',
	/**
	 * 支持工作流编排的聊天助手
	 */
	CHATFLOW = 'advanced-chat',
	/**
	 * 具备推理和自主调用能力的聊天助手
	 */
	AGENT = 'agent-chat',
}

/**
 * 应用类型的展示标签
 */
export const AppModeLabels = {
	[AppModeEnums.TEXT_GENERATOR]: 'Text Generator',
	[AppModeEnums.CHATBOT]: 'Chatbot',
	[AppModeEnums.WORKFLOW]: 'Workflow',
	[AppModeEnums.CHATFLOW]: 'Chatflow',
	[AppModeEnums.AGENT]: 'Agent',
}

/**
 * 应用类型的展示名称
 */
export const AppModeNames = {
	[AppModeEnums.TEXT_GENERATOR]: '文本生成',
	[AppModeEnums.CHATBOT]: '聊天助手',
	[AppModeEnums.WORKFLOW]: '工作流',
	[AppModeEnums.CHATFLOW]: '支持工作流编排的聊天助手',
	[AppModeEnums.AGENT]: '具备推理和自主调用能力的聊天助手',
}

/**
 * 获取应用类型的完整名称
 */
const getAppModelFullName = (mode: AppModeEnums) => {
	return `${AppModeLabels[mode]}（${AppModeNames[mode]}）`
}

/**
 * 应用类型选项
 */
export const AppModeOptions = [
	AppModeEnums.CHATBOT,
	AppModeEnums.WORKFLOW,
	AppModeEnums.CHATFLOW,
	AppModeEnums.AGENT,
	AppModeEnums.TEXT_GENERATOR,
].map(mode => {
	return {
		label: getAppModelFullName(mode),
		value: mode,
	}
})

/**
 * 开场白展示模式
 */
export const OpeningStatementDisplayMode = {
	Default: 'default',
	Always: 'always',
}

/**
 * 开场白展示模式选项
 */
export const OpeningStatementDisplayModeOptions = [
	{
		label: '默认（开始对话前展示）',
		value: OpeningStatementDisplayMode.Default,
	},
	{
		label: '总是展示',
		value: OpeningStatementDisplayMode.Always,
	},
]

/**
 * 欢迎词的配置
 */

export const WelcomeConfig = {
	title: '你好, 我是奥晨智能客服',
	aiIconUrl:
		'https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp',
	description:
		'我们专注于提供开发制造塑料家具、日用品、汽摩配件、物流系列等专业成型一站式解决方案，致力于为您的项目提供高效可靠的技术支持与服务。',
}

export const AppName = '魔博士'
