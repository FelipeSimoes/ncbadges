module.exports = {
  presets: [
    [require.resolve('babel-preset-env'), {
      targets: {
        browsers: [
          'last 1 Chrome versions',
          'last 1 Edge versions',
          'last 1 Firefox versions',
          'last 1 IE version',
          'last 1 iOS versions',
          'last 1 Opera versions',
          'last 1 Safari versions',
          'not ie < 11'
        ]
      },
      uglify: true,
      modules: 'commonjs'
    }]
  ],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      require.resolve('babel-plugin-transform-es2015-modules-commonjs'),
      require.resolve('babel-plugin-webpack-alias'),
      {
        config: require.resolve(`${process.cwd()}/configs/webpack.config.js`)
      }
    ]
  ]
};
