import { Card, type CardProps } from '@shopify/polaris';
import './index.css';

export function CustomCard(props: CardProps) {
  return (
    <div className="custom-card">
      <Card {...props} />
    </div>
  );
}
