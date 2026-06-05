import { NavMenu } from '@shopify/app-bridge-react';
import { AppProvider, Frame, Page } from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import { Link, Outlet } from 'react-router';
import '@shopify/polaris/build/esm/styles.css';

import { PolarisRouterLink } from './PolarisRouterLink';

export interface NavLinkItem {
  to: string;
  label: string;
}

export interface AppLayoutProps {
  /** Label of the home ("/") nav entry. */
  homeLabel?: string;
  /** App-specific nav entries, rendered after the home entry. */
  links: NavLinkItem[];
}

/**
 * Standard embedded-app shell: Polaris AppProvider (with router-aware links),
 * App Bridge NavMenu and a Polaris Frame/Page around the routed outlet.
 */
export function AppLayout({ homeLabel = 'Dashboard', links }: AppLayoutProps) {
  return (
    <AppProvider i18n={en} linkComponent={PolarisRouterLink}>
      <NavMenu>
        <Link to="/" rel="home">
          {homeLabel}
        </Link>
        {links.map((link) => (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ))}
      </NavMenu>
      <Frame>
        <Page>
          <Outlet />
        </Page>
      </Frame>
    </AppProvider>
  );
}
