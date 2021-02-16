const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

module.exports = {
  entry: './bootstrap.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  resolve: {
    alias: {
      'maplestory-reverse-wasm': path.resolve(__dirname, 'wasm/pkg'),
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        'index.html',
        'style.css',
        { from: 'src/assets', to: 'assets' },
      ],
    }),
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, 'wasm'),
      // https://github.com/wasm-tool/wasm-pack-plugin/issues/93
      outDir: path.resolve(__dirname, 'wasm/pkg'),
    }),
  ],
  experiments: {
    syncWebAssembly: true,
  },
};
