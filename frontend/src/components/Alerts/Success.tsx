interface Props {
  text: string
}

export default function SuccessAlert({ text }: Props) {
	return (
		<div className="alert alert-success alert-dismissible fade show" role="alert">
			<strong>Success!</strong> {text}.
			<button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		</div>
	);
}
