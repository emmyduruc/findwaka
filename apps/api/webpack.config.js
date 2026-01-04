const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/main.ts',
  target: 'node',
  externals: [
    nodeExternals({
      // Allow bundling of files from node_modules, except these
      allowlist: [/^@findwaka/],
    }),
    // Mark optional NestJS dependencies as externals
    '@nestjs/microservices',
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets',
    '@nestjs/websockets/socket-module',
    '@nestjs/platform-express',
    '@nestjs/platform-fastify',
  ],
  output: {
    path: path.resolve(__dirname, '../../dist/apps/api'),
    filename: 'main.js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@findwaka/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
    // Ignore optional dependencies
    fallback: {
      '@nestjs/microservices': false,
      '@nestjs/websockets': false,
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.app.json'),
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [],
  devtool: process.env.NODE_ENV !== 'production' ? 'source-map' : false,
};
