import { Dropdown } from 'antd';
import { useThemeContext } from '../hooks';
import { ThemeModeEnum } from '../constants';
import { DynamicIcon } from 'lucide-react/dynamic';
import { useLangContext } from '@dify-chat/lang';

interface IThemeSelectorProps {
	children?: React.ReactNode;
}

/**
 * 主题选择器组件
 */
export default function ThemeSelector(props: IThemeSelectorProps) {
	const { children } = props;
	const { themeMode, setThemeMode } = useThemeContext();
	const { t } = useLangContext();
	return (
		<Dropdown
			placement="bottomRight"
			menu={{
				selectedKeys: [themeMode],
				items: [
					{
						type: 'item',
						key: ThemeModeEnum.SYSTEM,
						label: t('theme.system'),
						icon: <DynamicIcon name="screen-share" />,
					},
					{
						type: 'item',
						key: ThemeModeEnum.LIGHT,
						label: t('theme.light'),
						icon: <DynamicIcon name="sun" />,
					},
					{
						type: 'item',
						key: ThemeModeEnum.DARK,
						label: t('theme.dark'),
						icon: <DynamicIcon name="moon-star" />,
					},
				],
				onClick: (item) => {
					setThemeMode(item.key as ThemeModeEnum);
				},
			}}
		>
			{children}
		</Dropdown>
	);
}
