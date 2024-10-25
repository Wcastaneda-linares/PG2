import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  "appId": "io.ionic.starter",
  "appName": "AdoptaYa",
  "webDir": "www",
  "bundledWebRuntime": false,
  android: {
    allowMixedContent: true,  // Necesario si usas recursos mixtos
  }
};

export default config;
