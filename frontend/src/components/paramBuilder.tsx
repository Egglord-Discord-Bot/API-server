import type { EndpointParam } from '../types';

interface Props {
  EndpointParam: Array<EndpointParam>
}

export default function Home({ EndpointParam }: Props) {
	return (
		<>
			{EndpointParam?.map(e => (
				<div className="row mb-3" key={e.name}>
					<label htmlFor={e.name} className="col-sm-2 col-form-label">{e.name}:</label>
					<div className="col-sm-10">
						{e.type == 'string' ?
							(e.enum?.length ?? 0) >= 1 ?
								<select className="form-select" id={e.name} name={`param_${EndpointParam.indexOf(e)}`} aria-label="Default select example">
									{e.enum?.map(s => (
										<option value={s} key={s}>{s}</option>
									))}
								</select>
								:
								<input type="text" className="form-control" name={`param_${EndpointParam.indexOf(e)}`} id={e.name} required={e.required} defaultValue={e.default} autoComplete="off" />
							: <input type="number" className="form-control" name={`param_${EndpointParam.indexOf(e)}`} id={e.name} required={e.required} max={e.maximum} min={e.minimum} defaultValue={e.default} autoComplete="off" />
						}
						<div id="passwordHelpBlock" className="form-text">
							{e.description}
						</div>
					</div>
				</div>
			))}
		</>
	);
}
