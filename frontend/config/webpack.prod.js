const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

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

        mode: 'production',
        devtool: 'source-map',
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    uglifyOptions: {
                        sourceMap: true,
                        mangle: {
                            keep_fnames: true,
                        },
                    },
                }),
                new OptimizeCssAssetsPlugin(),
            ],
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
                        MiniCssExtractPlugin.loader,
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
                filename: '[name].[hash].css',
                chunkFilename: '[id].[hash].css',
            }),
        ],
    };
};
