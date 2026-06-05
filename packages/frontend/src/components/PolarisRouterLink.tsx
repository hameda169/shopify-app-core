import { Link } from 'react-router';

/** Polaris linkComponent backed by react-router, so Polaris links navigate client-side. */
export function PolarisRouterLink(props: { url: string; children?: React.ReactNode }) {
  const { url, children, ...rest } = props;
  return (
    <Link to={url} {...rest}>
      {children}
    </Link>
  );
}
