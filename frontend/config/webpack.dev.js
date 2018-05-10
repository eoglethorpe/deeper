const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const getEnvVariables = require('./env.js');

module.exports = (env) => {
    const ENV_VARS = getEnvVariables(env);

    return {
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/',
            chunkFilename: '[name].[chunkhash].js',
            filename: '[name].[chunkhash].js',
        },

        mode: 'development',
        performance: {
            hints: 'warning',
        },
        stats: {
            assets: true,
            colors: true,
            errors: true,
            errorDetails: true,
            hash: true,
        },
        devtool: 'cheap-module-eval-source-map',
        devServer: {
            host: '0.0.0.0',
            port: 3000,
            overlay: true,
        },


        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    include: path.resolve(__dirname, 'src'),
                    use: [
                        'babel-loader',
                        'eslint-loader',
                    ],
                },
                {
                    test: /\.scss$/,
                    include: path.resolve(__dirname, 'src'),
                    use: [
                        'style-loader',
                        {
                            loader: require.resolve('css-loader'),
                            options: {
                                importLoaders: 1,
                                modules: true,
                                camelCase: true,
                                sourceMap: true,
                                localIdentName: '[name]_[local]_[hash:base64]',
                            },
                        },
                        require.resolve('sass-loader'),
                    ],
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    use: ['file-loader'],
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': ENV_VARS,
            }),
            new CircularDependencyPlugin({
                exclude: /node_modules/,
                failOnError: false,
                allowAsyncCycles: false,
                cwd: process.cwd(),
            }),
            new CleanWebpackPlugin(['dist']),
            new HtmlWebpackPlugin({
                template: './public/index.html',
                filename: './index.html',
                chunksSortMode: 'none',
            }),
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[id].css',
            }),
        ],
    };
};
