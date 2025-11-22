module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Keep this plugin LAST - required for react-native-reanimated
      // It must be the last plugin in the array
      'react-native-reanimated/plugin',
    ],
  };
};

