const webpack = require("webpack")

module.exports = function override(config, env) {
    config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: require.resolve("stream-browserify"),
        crypto: require.resolve('crypto-browserify'),
        buffer: require.resolve("buffer"),
        assert: false,
        http: false,
        https: false,
        zlib: false,
        url: false
    }
    config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"]
    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            process: "process/browser.js",
            Buffer: ["buffer", "Buffer"],
        }),
    ]
    
    config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin.constructor && plugin.constructor.name === "ModuleScopePlugin"));


    return config
}