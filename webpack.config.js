const path = require('path');

module.exports = {

  entry: './index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpackBundle.js'
  },

  mode: 'development',

  rules: [
    {
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }
]


};