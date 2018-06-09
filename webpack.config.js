const path = require('path');
const webpack = require('webpack');
const winston = require('winston-color');
const CopyWebpackPlugin = require('copy-webpack-plugin');
//const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackSynchronizableShellPlugin = require('webpack-synchronizable-shell-plugin');
const NativeScriptVueExternals = require('nativescript-vue-externals');
const NativeScriptVueTarget = require('nativescript-vue-target');

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
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/]
          }
        },
        {
          test: /\.tsx$/,
          exclude: /(node_modules)/,
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/]
          }
        },
        {
          test: /\.scss$/,
          use: [
              "css-loader", // translates CSS into CommonJS
              "sass-loader" // compiles Sass to CSS
          ]
        },

        {
          test: /\.css$/,
          use: [
              "css-loader", // translates CSS into CommonJS
          ]
        },

        {
          test: /\.vue$/,
          loader: 'ns-vue-loader',
          options: {
            loaders: {
              css: 'css-loader',
              scss: 'sass-loader',
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

    optimization: {
      minimize: false
    },

    externals: NativeScriptVueExternals,

    plugins: [

      // Optimize CSS output
      new OptimizeCssAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorOptions: {
          discardComments: { removeAll: true },
          normalizeUrl: false
        },
        canPrint: false,
      }),

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
