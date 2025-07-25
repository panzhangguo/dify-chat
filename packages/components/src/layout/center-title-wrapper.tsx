import classNames from 'classnames'

/**
 * 头部标题区域容器
 */
export default function CenterTitleWrapper(props: { children: React.ReactNode }) {
	return (
		<div className="flex h-full items-center flex-[1] overflow-hidden justify-center font-semibold">
			<div
				className={classNames({
					'flex items-center rounded-3xl py-2 px-4 text-sm overflow-hidden': true,
					'shadow-md': props.children,
				})}
			>
				{props.children}
			</div>
		</div>
	)
}
