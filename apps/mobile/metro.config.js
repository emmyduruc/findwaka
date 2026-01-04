const { getDefaultConfig } = require("@expo/metro-config");
const { mergeConfig } = require("metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const customConfig = {
  cacheVersion: "mobile",
  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer")
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, "cjs", "mjs", "svg"],
    alias: {
      "@findwaka/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
  watchFolders: [
    path.resolve(__dirname, "../../packages/shared"),
  ],
};

function createConfig() {
  const mergedConfig = mergeConfig(defaultConfig, customConfig);
  
  return withNativeWind(mergedConfig, {
    input: "./global.css"
  });
}

module.exports = createConfig();
