import type { ReactElement } from 'react';

interface Props {
  id: string
  header: ReactElement
  children: ReactElement
}

export default function CollapsibleCard({ id, header, children }: Props) {
	return (
		<div className="accordion" id={`mainAccordion_${id}`}>
			<div className="accordion-item">
				<h2 className="card-header" id="headingOne">
					<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#${id}`} aria-expanded="true" aria-controls="collapseOne" style={{ backgroundColor: '#FFFFFF' }}>
						{header}
					</button>
				</h2>
				<div id={id} className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent={`#mainAccordion_${id}`}>
					<div className="accordion-body">
					  {children}
					</div>
				</div>
			</div>
		</div>
	);
}
