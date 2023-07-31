import { Chart as ChartJS, ArcElement, Tooltip, Legend,	CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import type { ChartData, CoreChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { CSSProperties } from 'react';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
  data: ChartData<'line'>
  options: CoreChartOptions<'line'> | undefined
  style: CSSProperties | undefined
}

export default function PieChart({ data, options = undefined, style = undefined }: Props) {
	return (
		<Line data={data} options={options} style={style}/>
	);
}
