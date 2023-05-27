import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
interface Props {
  title: string
  text: string
  icon: IconDefinition
  colour?: string
}


export default function ErrorPopup({ title, text, icon, colour }: Props) {
	const randomColor = colour ?? `#${Math.floor(Math.random() * 16777215).toString(16)}`;
	return (
		<div className="card shadow h-100 py-2" style={{ borderLeft: `.25rem solid ${randomColor}` }}>
			<div className="card-body">
				<div className="row no-gutters align-items-center ">
					<div className="col mr-2">
						<b className="text-xs font-weight-bold text-uppercase mb-1" style={{ color: randomColor }}>{title}</b>
						<h4 className="h5 mb-0 font-weight-bold text-gray-800">{text}</h4>
					</div>
					<div className="col-auto">
						<FontAwesomeIcon icon={icon} className="fa-2x" />
					</div>
				</div>
			</div>
		</div>
	);
}
