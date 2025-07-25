import {
	AimOutlined,
	FileOutlined,
	FileWordOutlined,
	IeOutlined,
	ShareAltOutlined,
	StarOutlined,
} from '@ant-design/icons'
import { IRetrieverResource } from '@dify-chat/api'
import { useIsMobile } from '@dify-chat/helpers'
import { useLangContext } from '@dify-chat/lang'
import { Divider, Popover, Space, Tooltip } from 'antd'

interface IRetrieverResourceGroupedItem {
	id: string
	name: string
	data_source_type: IRetrieverResource['data_source_type']
	items: IRetrieverResource[]
}

interface IMetricItemProps {
	icon: React.ReactNode
	title: string
	value: string | number
}

/**
 * 知识库引用的指标项目
 */
const MetricItem = (props: IMetricItemProps) => {
	return (
		<Tooltip
			title={props.title}
			arrow
		>
			<div className="flex items-center">
				{props.icon}
				<span className="ml-1 flex-1 truncate">{props.value}</span>
			</div>
		</Tooltip>
	)
}

const ReferenceItem = (props: IRetrieverResourceGroupedItem) => {
	const isMobile = useIsMobile()
	const { t } = useLangContext()
	return (
		<div
			className="text-gray-500 flex items-center"
			title={props.name}
		>
			<Popover
				trigger={['click']}
				classNames={{
					body: 'max-h-[50vh] max-w-[85vw] md:max-w-[50vw] overflow-y-auto overflow-x-hidden',
				}}
				title={
					<div
						title={props.name}
						className="w-full truncate"
					>
						{props.name}
					</div>
				}
				placement={isMobile ? 'top' : 'topLeft'}
				content={
					<Space
						className="w-full overflow-hidden"
						split={
							<Divider
								style={{
									margin: '10px 0',
								}}
								variant="dotted"
								type="horizontal"
							/>
						}
						direction="vertical"
					>
						{props.items.map(item => {
							return (
								<div
									className="w-full overflow-hidden"
									key={item.id}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center">
											<span className="text-desc">#{item.segment_position}</span>
										</div>
										{/* TODO: 需要添加应用配置：知识库 BaseURL 才能支持跳转 */}
										{/* <a
												target="_blank"
												rel="noreferrer"
												href={`https://cloud.dify.ai/datasets/${item.dataset_id}/documents/${item.document_id}`}
											>
												跳转到知识库 <ArrowRightOutlined className="ml-2" />
											</a> */}
									</div>
									<div className="mt-2 w-full overflow-hidden">
										<div>{item.content}</div>
										<Space
											size="middle"
											className="flex items-center text-desc mt-2 flex-wrap w-full overflow-hidden"
										>
											{[
												{
													id: `${item.segment_id}_word_count`,
													icon: <FileWordOutlined />,
													title: `${t('chat.referrence.word_count')}: ${item.word_count}`,
													value: item.word_count,
													visible: !!item.word_count,
												},
												{
													id: `${item.segment_id}_hit_count`,
													icon: <AimOutlined />,
													title: `${t('chat.referrence.hit_count')}: ${item.hit_count}`,
													value: item.hit_count,
													visible: !!item.hit_count,
												},
												{
													id: `${item.segment_id}_index_node_hash`,
													icon: <ShareAltOutlined />,
													title: `${t('chat.referrence.index_node_hash')}: ${item.index_node_hash}`,
													value: item.index_node_hash?.substring(0, 7),
													visible: !!item.index_node_hash,
												},
												{
													id: `${item.segment_id}_score`,
													icon: <StarOutlined />,
													title: `${t('chat.referrence.score')}: ${item.score}`,
													value: item.score,
													visible: !!item.score,
												},
											]
												.filter(item => {
													return item.visible
												})
												.map(metric => (
													<MetricItem
														key={metric.id}
														icon={metric.icon}
														title={metric.title}
														value={metric.value}
													/>
												))}
										</Space>
									</div>
								</div>
							)
						})}
					</Space>
				}
			>
				{props.data_source_type === 'website_crawl' ? (
					<IeOutlined />
				) : props.data_source_type === 'upload_file' ? (
					<FileOutlined />
				) : null}
				<span className="cursor-pointer hover:underline ml-1">{props.name}</span>
			</Popover>
		</div>
	)
}

interface IMessageReferrenceProps {
	/**
	 * 消息引用链接列表
	 */
	items?: IRetrieverResource[]
}

/**
 * 消息引用链接列表
 */
export default function MessageReferrence(props: IMessageReferrenceProps) {
	const { items } = props
	const { t } = useLangContext()
	if (!items?.length) {
		return null
	}

	const groupedItems: IRetrieverResourceGroupedItem[] = items.reduce((acc, item) => {
		const documentId = item.document_id
		const matchedItem = acc.find(item => item.id === documentId)
		if (!matchedItem) {
			acc.push({
				id: item.document_id,
				name: item.document_name,
				data_source_type: item.data_source_type,
				items: [item],
			})
		} else {
			matchedItem.items.push(item)
		}
		return acc
	}, [] as IRetrieverResourceGroupedItem[])

	return (
		<div className="pb-3">
			<div className="flex items-center text-gray-400">
				<span className="mr-3 text-sm">{t('chat.referrence.name')}</span>
				<div className="flex-1 border-gray-400 border-dashed border-0 border-t h-0" />
			</div>
			{groupedItems.map(item => {
				return (
					<div
						className="mt-2 truncate"
						key={item.id}
					>
						<ReferenceItem {...item} />
					</div>
				)
			})}
		</div>
	)
}
