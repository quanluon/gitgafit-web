declare module 'react-pwa-installer-prompt' {
  import { ReactNode } from 'react';

  export interface PWAInstallStatus {
    isInstallAllowed: boolean;
    isInstallWatingConfirm: boolean;
    isInstalling: boolean;
    isInstallCancelled: boolean;
    isInstallSuccess: boolean;
    isInstallFailed: boolean;
  }
  export interface PWAInstallerPromptRenderProps {
    onClick: () => void;
  }
  export interface PWAInstallerPromptProps {
    render: (props: PWAInstallerPromptRenderProps) => ReactNode;
    callback?: (data: PWAInstallStatus) => void;
  }
  const PWAInstallerPrompt: React.FC<PWAInstallerPromptProps>;
  export default PWAInstallerPrompt;
}
