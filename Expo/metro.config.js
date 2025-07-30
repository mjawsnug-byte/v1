const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Platform-specific extensions for better web/native compatibility
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.platformExtensions = ['web.js', 'web.ts', 'web.tsx', 'js', 'ts', 'tsx'];

// Handle react-native-maps gracefully on web
config.resolver.resolverMainFields = ['react-native', 'browser', 'module', 'main'];

// Better transformer configuration for Android compatibility
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Block react-native-maps on web to prevent native module errors
config.resolver.alias = {
  'react-native-maps': require.resolve('./components/MapComponents.web.tsx')
};

module.exports = config;