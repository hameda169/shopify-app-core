import { SaveBar as AppBridgeSaveBar } from '@shopify/app-bridge-react';
import { useCallback } from 'react';

interface Props {
  visible: boolean;
  loading?: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
}

const EmbeddedNewSaveBar = ({ visible, loading, onSave, onDiscard }: Props) => {
  const handleDiscard = useCallback(() => {
    onDiscard?.();
  }, [onDiscard]);

  return (
    <AppBridgeSaveBar id="save-bar" open={visible}>
      <button variant="primary" onClick={onSave} loading={loading ? '' : undefined}></button>
      <button onClick={handleDiscard} disabled={loading}></button>
    </AppBridgeSaveBar>
  );
};

export const SaveBar = ({ visible, loading, onSave, onDiscard }: Props) => {
  return <EmbeddedNewSaveBar visible={visible} loading={loading} onSave={onSave} onDiscard={onDiscard} />;
};
