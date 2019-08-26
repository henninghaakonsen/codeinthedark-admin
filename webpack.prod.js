const common = require("./webpack.common");
const merge = require("webpack-merge");
const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const config = merge.strategy({
    "entry.codeinthedark-admin": "prepend",
    "module.rules": "append"
})(common, {
    mode: "production",
    entry: {
        "codeinthedark-admin": ["babel-polyfill"]
    },
    output: {
        path: path.join(__dirname, "production"),
        filename: "[name].[contenthash].js",
        publicPath: "/assets/"
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.(css|less)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 2
                        }
                    },
                    { loader: "postcss-loader" },
                    {
                        loader: "less-loader",
                        options: {
                            globalVars: {
                                coreModulePath: '"~"',
                                nodeModulesPath: '"~"'
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("production")
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new MiniCssExtractPlugin({
            filename: "codeinthedark-admin-frontend.css",
            allChunks: true
        })
    ],
    optimization: {
        minimizer: [new TerserPlugin()]
    }
});

module.exports = config;
