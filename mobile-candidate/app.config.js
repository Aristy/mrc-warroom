module.exports = {
  name: 'DSN2026 Candidat',
  slug: 'dsn2026-candidat',
  version: '1.0.1',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: { image: './assets/splash.png', backgroundColor: '#9a1f1f' },
  android: { package: 'com.mrc.candidate', adaptiveIcon: { foregroundImage: './assets/icon.png', backgroundColor: '#9a1f1f' } },
  extra: { eas: { projectId: 'warroom-candidate' } },
};
