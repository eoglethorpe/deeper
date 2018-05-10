const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ShellRunPlugin = require('./shellrun-plugin');

const getEnvVariables = require('./env.js');

const appBase = process.cwd();
const appSrc = path.resolve(appBase, 'src/');
const appDist = path.resolve(appBase, 'build/');
const appIndexJs = path.resolve(appBase, 'src/index.js');
const appIndexHtml = path.resolve(appBase, 'public/index.html');

module.exports = (env) => {
    const ENV_VARS = getEnvVariables(env);

    return {
        entry: appIndexJs,
        output: {
            path: appDist,
            publicPath: '/',
            chunkFilename: 'js/[name].[chunkhash].js',
            filename: 'js/[name].[chunkhash].js',
            sourceMapFilename: 'sourcemaps/[file].map',
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
            watchOptions: {
                ignored: /node_modules/,
            },
        },

        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    include: appSrc,
                    use: [
                        'babel-loader',
                        'eslint-loader',
                    ],
                },
                {
                    test: /\.scss$/,
                    include: appSrc,
                    use: [
                        'style-loader',
                        {
                            loader: require.resolve('css-loader'),
                            options: {
                                importLoaders: 1,
                                modules: true,
                                camelCase: true,
                                localIdentName: '[name]_[local]_[hash:base64]',
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
                            options: {
                                name: 'assets/[hash].[ext]',
                            },
                        },
                    ],
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
                cwd: appBase,
            }),
            new CleanWebpackPlugin([appDist], { root: appBase }),
            new HtmlWebpackPlugin({
                template: appIndexHtml,
                filename: './index.html',
                chunksSortMode: 'none',
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].css',
                chunkFilename: 'css/[id].css',
            }),
            new ShellRunPlugin({
                messageBefore: 'Generating language map.',
                command: `
                    find ${appSrc} -name *.js |
                        xargs /usr/bin/gawk -f ${appSrc}/utils/finder.awk > usage.tmp &&
                        mkdir -p ${appSrc}/generated &&
                        rsync -c usage.tmp ${appSrc}/generated/usage.js;
                        rm usage.tmp;
                `,
                messageAfter: 'Done.',
            }),
        ],
    };
};
