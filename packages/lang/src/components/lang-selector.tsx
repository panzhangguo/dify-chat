import { Dropdown } from 'antd';
import { useLangContext } from '../hooks';
import { LangEnum, LangLabelEnum } from '../constants';

interface IThemeSelectorProps {
	children?: React.ReactNode;
}

/**
 * 主题选择器组件
 */
export default function LangSelector(props: IThemeSelectorProps) {
	const { children } = props;
	const { lang, setLang } = useLangContext();

	return (
		<Dropdown
			placement="bottomRight"
			menu={{
				selectedKeys: [lang],
				items: [
					{
						type: 'item',
						key: LangEnum.ZH_CN,
						label: LangLabelEnum.ZH_CN,
					},
					{
						type: 'item',
						key: LangEnum.EN_US,
						label: LangLabelEnum.EN_US,
					},
				],
				onClick: (item) => {
					setLang(item.key as LangEnum);
				},
			}}
		>
			{children}
		</Dropdown>
	);
}
