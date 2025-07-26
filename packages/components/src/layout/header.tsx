import { LucideIcon } from '@dify-chat/components'
import { useAppContext } from '@dify-chat/core'
import { useIsMobile } from '@dify-chat/helpers'
import { LangEnum, LangSelector, useLangContext } from '@dify-chat/lang'
import { ThemeSelector, useThemeContext } from '@dify-chat/theme'
import { useMount } from 'ahooks'
import { Space } from 'antd'
import classNames from 'classnames'
import { useHistory } from 'pure-react-router'
import React, { useEffect } from 'react'

import CenterTitleWrapper from './center-title-wrapper'
import { Logo } from './logo'

interface IHeaderLayoutProps {
	title?: React.ReactNode
	rightIcon?: React.ReactNode
	className?: string
}

const HeaderSiderIcon = (props: { align: 'left' | 'right'; children: React.ReactNode }) => {
	return (
		<div
			className={classNames({
				'flex-1 h-full flex items-center': true,
				'justify-start': props.align === 'left',
				'justify-end': props.align === 'right',
			})}
		>
			{props.children}
		</div>
	)
}

/**
 * 头部布局组件
 */
export default function HeaderLayout(props: IHeaderLayoutProps) {
	const { title, rightIcon, className } = props
	const { themeMode } = useThemeContext()
	const { apps, setCurrentAppId } = useAppContext()
	const { lang } = useLangContext()
	const isMobile = useIsMobile()
	const history = useHistory()

	useEffect(() => {
		const toApp = apps?.find(item => (item.extConfig?.language as LangEnum) === lang)
		if (toApp) {
			history.replace(`/app/${toApp.id}`)
			setCurrentAppId(toApp.id)
		}
	}, [lang, apps])

	return (
		<div className={classNames('h-16 flex items-center justify-between px-4', className)}>
			{/* 🌟 Logo */}
			<HeaderSiderIcon align="left">
				<Logo
					hideText={isMobile}
					hideGithubIcon
				/>
			</HeaderSiderIcon>

			<CenterTitleWrapper>{title}</CenterTitleWrapper>

			{/* 右侧图标 */}
			<HeaderSiderIcon align="right">
				{rightIcon || (
					<Space
						className="flex items-center"
						size={16}
					>
						<ThemeSelector>
							<div className="flex items-center cursor-pointer">
								<LucideIcon
									name={
										themeMode === 'dark'
											? 'moon-star'
											: themeMode === 'light'
												? 'sun'
												: 'screen-share'
									}
									size={20}
								/>
							</div>
						</ThemeSelector>
						{/* <GithubIcon /> */}
						<LangSelector>
							<div className="flex items-center cursor-pointer">
								<LucideIcon
									name="languages"
									size={20}
								/>
							</div>
						</LangSelector>
					</Space>
				)}
			</HeaderSiderIcon>
		</div>
	)
}
