const rewire = require('rewire');
const webpack = require('webpack');
const defaults = rewire('react-scripts/scripts/start.js');
const webpackConfig = require('react-scripts/config/webpack.config');

function disableEqeqeq(config) {
    config.plugins.forEach((plugin) => {
        if (plugin?.constructor?.name === 'ESLintWebpackPlugin' && plugin.options) {
            plugin.options.baseConfig = {
                ...plugin.options.baseConfig,
                rules: {
                    ...(plugin.options.baseConfig?.rules || {}),
                    eqeqeq: 'off',
                },
            };
            plugin.options.overrideConfig = {
                ...(plugin.options.overrideConfig || {}),
                rules: {
                    ...(plugin.options.overrideConfig?.rules || {}),
                    eqeqeq: 'off',
                },
            };
        }
    });
}

//In order to override the webpack configuration without ejecting the create-react-app
defaults.__set__('configFactory', (webpackEnv) => {
    let config = webpackConfig(webpackEnv);

    //Customize the webpack configuration here.
    config.resolve.fallback = {
        ...config.resolve.fallback,
        process: require.resolve('process/browser'),
        zlib: require.resolve('browserify-zlib'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util'),
        buffer: require.resolve('buffer'),
        asset: require.resolve('assert'),
    };

    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
        }),
    ];

    // Ignore == vs === (eqeqeq) while keeping other ESLint rules
    disableEqeqeq(config);

    return config;
});
