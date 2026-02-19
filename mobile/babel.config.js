module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            ['babel-plugin-transform-import-meta', { module: 'ES6' }]
        ],
        overrides: [
            {
                test: /[\\/]node_modules[\\/]react-native-toast-message[\\/]/,
                presets: ['babel-preset-expo']
            }
        ]
    };
};
