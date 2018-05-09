const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = (env) => {
    const NODE_ENV = env.NODE_ENV ? env.NODE_ENV : 'development';

    const reducerFn = (acc, key) => {
        acc[`process.env.${key}`] = JSON.stringify(process.env[key]);
        return acc;
    };
    const initialVal = { 'process.env.NODE_ENV': JSON.stringify(NODE_ENV) };

    const envVars = Object.keys(process.env)
        .filter(v => v.startsWith('REACT_APP_'))
        .reduce(reducerFn, initialVal);

    const devMode = NODE_ENV === 'development';

    return {
        devtool: 'cheap-eval-source-map',
        devServer: {
            host: '0.0.0.0',
            port: 3000,
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: [
                        'babel-loader',
                        'eslint-loader',
                    ],
                },
                {
                    test: /\.scss$/,
                    use: [
                        devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                        {
                            loader: require.resolve('css-loader'),
                            options: {
                                importLoaders: 2,
                                modules: true,
                                camelCase: true,
                            },
                        },
                        require.resolve('sass-loader'),
                    ],
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {},
                        },
                    ],
                },
            ],
        },
        plugins: [
            new CircularDependencyPlugin({
                exclude: /node_modules/,
                failOnError: false,
                allowAsyncCycles: false,
                cwd: process.cwd(),
            }),
            new HtmlWebpackPlugin({
                template: './public/index.html',
                filename: './index.html',
                chunksSortMode: 'none',
            }),
            new MiniCssExtractPlugin({
                filename: devMode ? '[name].css' : '[name].[hash].css',
                chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
            }),
            new webpack.DefinePlugin(envVars),
        ],
        output: {
            publicPath: '/',
            chunkFilename: '[name].[chunkhash].js',
            filename: '[name].[chunkhash].js',
            path: path.resolve(__dirname, 'dist'),
        },
    };
};
