const path = require('path');
const webpack = require('webpack');
const winston = require('winston-color');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackSynchronizableShellPlugin = require('webpack-synchronizable-shell-plugin');
const NativeScriptVueExternals = require('nativescript-vue-externals');
const NativeScriptVueTarget = require('nativescript-vue-target');
const devMode = process.env.NODE_ENV !== 'production'

// Prepare NativeScript application from template (if necessary)
require('./prepare')();

// Generate platform-specific webpack configuration
const config = (platform, launchArgs) => {

  winston.info(`Bundling application for ${platform}...`);


  return {

    devtool: 'inline-source-map',

    target: NativeScriptVueTarget,

    entry: path.resolve(__dirname, './src/main.ts'),

    output: {
      path: path.resolve(__dirname, './dist/app'),
      filename: `app.${platform}.js`,
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader',
        },
        {
          test: /\.ts$/,
          exclude: /(node_modules)/,
          loader: 'ts-loader'
        },
        {
          test: /\.(scss|css)$/,
          use: [
              MiniCssExtractPlugin.loader,
              {
                loader: "css-loader"
              },
              "sass-loader"
          ]
        },

        {
          test: /\.vue$/,
          loader: 'ns-vue-loader',
          options: {
            loaders: {
              css: [
                MiniCssExtractPlugin.loader,
                {
                  loader: "css-loader"
                }
              ],
              scss: [
                MiniCssExtractPlugin.loader,
                {
                  loader: "css-loader"
                },
                'sass-loader'
              ]
            },
          },
        },
      ],
    },

    resolve: {
      modules: [
        'node_modules/tns-core-modules',
        'node_modules',
      ],
      extensions: [
        `.${platform}.css`,
        '.css',
        `.${platform}.scss`,
        '.scss',
        `.${platform}.js`,
        '.js',
        `.${platform}.ts`,
        '.ts',
        `.${platform}.tsx`,
        '.tsx',
        `.${platform}.vue`,
        '.vue',
      ],
    },

    externals: NativeScriptVueExternals,

    plugins: [
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: devMode ? 'app.'+platform+'.css' : '[name].[hash].css',
        //chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
      }),
      /*new OptimizeCssAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorOptions: {
          discardComments: { removeAll: true },
          normalizeUrl: false
        },
        canPrint: false,
      }),*/

      // Copy src/assets/**/* to dist/
      new CopyWebpackPlugin([
        {from: 'assets', context: 'src'},
      ]),

      // Execute post-build scripts with specific arguments
      new WebpackSynchronizableShellPlugin({
        onBuildEnd: {
          scripts: [
            ... launchArgs ? [`node launch.js ${launchArgs}`] : [],
          ],
          blocking: false,
        },
      }),

    ],

    stats: 'errors-only',

    node: {
      'http': false,
      'timers': false,
      'setImmediate': false,
      'fs': 'empty',
    },

  };
};

// Determine platform(s) and action from webpack env arguments
module.exports = env => {
  const action = (!env || !env.tnsAction) ? 'build' : env.tnsAction;

  if (!env || (!env.android && !env.ios)) {
    return [config('android'), config('ios', action)];
  }

  return env.android && config('android', `${action} android`)
    || env.ios && config('ios', `${action} ios`)
    || {};
};
