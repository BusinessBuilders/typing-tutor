// Steps 338-339: Mobile App Configuration (Android & iOS)
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.typingtutor.autism',
  appName: 'Autism Typing Tutor',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#4CAF50',
      showSpinner: false,
    },
  },
};

export default config;
