// chrome-extension/webpack.config.js
const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background.js',
    contentScript: './src/contentScript.js',
    options: './src/options.js',
    popup: './src/popup.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  devtool: 'source-map',
};
