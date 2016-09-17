module.exports = {
  devServer: {
    contentBase: "./public",
  },
  module: {
    output: {
      path: __dirname,
      filename: "bundle.js"
    },
    loaders: [
      { test: /\.css$/, loader: "style!css" },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};
