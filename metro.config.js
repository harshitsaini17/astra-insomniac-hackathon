const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const nativeBuildBlockList = [
  /.*[/\\]android[/\\]\.cxx[/\\].*/,
  /.*[/\\]android[/\\]app[/\\]\.cxx[/\\].*/,
  /.*[/\\]android[/\\]app[/\\]build[/\\].*/,
  /.*[/\\]node_modules[/\\].*[/\\]android[/\\]\.cxx[/\\].*/,
  /.*[/\\]node_modules[/\\].*[/\\]android[/\\]build[/\\].*/,
];

config.resolver.blockList = [
  ...(config.resolver.blockList ?? []),
  ...nativeBuildBlockList,
];

module.exports = config;
