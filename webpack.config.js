const webpack = require('webpack');

module.exports = {
  devtool: 'cheap-inline-module-source-map',

  module: {
    rules: [{
      test: /\.(js)$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: [
            ['es2015', { modules: false }],
          ],
          plugins: [
            require('babel-plugin-transform-object-rest-spread'),
            require('babel-plugin-transform-runtime'),
          ],
        },
      }],
    }, {
      enforce: 'pre',
      test: /\.js$/,
      exclude: /(node_modules)/,
      include: /src/,
      loader: 'eslint-loader',
    }],
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};
