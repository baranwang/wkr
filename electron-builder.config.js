const { productName } = require("./package.json");
/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  productName,
  asar: true,
  files: ["**/dist/**"],
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64", "ia32", "arm64"],
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
      provider: "generic",
      url: "https://wkr.vercel.app/api/update",
      publishAutoUpdate: true,
    },
    {
      provider: "github",
      releaseType: "release",
    },
  ],
};

module.exports = config;
