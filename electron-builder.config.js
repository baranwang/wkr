/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  productName: '扣排神器',
  asar: true,
  files: ['app/**/dist/**'],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64', 'ia32', 'arm64'],
      },
    ],
  },
  nsis: {
    oneClick: false,
    perMachine: true,
    allowToChangeInstallationDirectory: true,
    uninstallDisplayName: productName,
  },
  publish: [
    {
      provider: 'generic',
      url: 'https://pia-player.baran.wang/api/update',
      publishAutoUpdate: true,
    },
    {
      provider: 'github',
      releaseType: 'release',
    },
  ],
};

module.exports = config;
