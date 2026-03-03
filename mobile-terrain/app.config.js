module.exports = {
  name: 'DSN2026 Terrain',
  slug: 'dsn2026-terrain',
  version: '1.0.1',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: { image: './assets/splash.png', backgroundColor: '#9a1f1f' },
  android: {
    package: 'com.mrc.terrain',
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE'],
    adaptiveIcon: { foregroundImage: './assets/icon.png', backgroundColor: '#9a1f1f' }
  },
  plugins: ['expo-location', 'expo-image-picker'],
  extra: { eas: { projectId: 'warroom-terrain' } },
};
