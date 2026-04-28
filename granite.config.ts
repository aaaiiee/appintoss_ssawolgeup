import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'ssawolgeup',
  brand: {
    displayName: '싸월급',
    primaryColor: '#FF6B35',
    icon: 'https://static.toss.im/appsintoss/25943/70ff34f8-5d32-4408-9043-2f6405abdc30.png',
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
    initialAccessoryButton: {
      id: 'settings',
      title: '설정',
      icon: { name: 'icon-setting-mono' },
    },
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
  webViewProps: {
    type: 'partner',
  },
  outdir: 'dist',
});
