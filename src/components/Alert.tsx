interface AlertProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  return <p className={`alert ${type}`}>{message}</p>;
}
