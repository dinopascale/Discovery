module.exports = {
    entry: {
      bundle: './app/index.js',
      //worker: './app/components/dataService/worker.js',
      //workerNoDb: './app/components/dataService/workerNoDb.js'
    },
    output: {
      filename: '[name].js'
    }
  ,
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  }
};
