/**
 * 头部标题区域容器
 */
export default function CenterTitleWrapper(props: { children: React.ReactNode }) {
	return (
		<div className="flex h-full items-center flex-[4] overflow-hidden justify-center font-semibold">
			<div className="flex items-center rounded-3xl shadow-md py-2 px-4 text-sm dark:shadow-none overflow-hidden">
				{props.children}
			</div>
		</div>
	)
}
