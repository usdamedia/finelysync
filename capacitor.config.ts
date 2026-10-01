import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finelysync.app',
  appName: 'FinelySync',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#ffffff',
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      clientId: '978808382506-a5v8nirrbf6it5ll6ea9hmlpp60a2ruf.apps.googleusercontent.com',
      androidClientId: '978808382506-a5v8nirrbf6it5ll6ea9hmlpp60a2ruf.apps.googleusercontent.com',
      serverClientId: '978808382506-a5v8nirrbf6it5ll6ea9hmlpp60a2ruf.apps.googleusercontent.com',
      iosClientId: '978808382506-rgur1dirqvnkp63ga90s75e0ettmgd69.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
