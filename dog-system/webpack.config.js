const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require("copy-webpack-plugin");
var express = require('express');
var app = express();

app.use("./src/css", express.static("css"));
app.use("./src/js", express.static("js"));
app.use("./src/vendor", express.static("vendor"));

module.exports = {
  entry: "./src/index.js",
  mode: 'development',
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
    {
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
    },
    {
      test: /\.(png|svg|jpg|gif)$/,
      loader:'url-loader',
      options: {
        limit: 10000,
        name: 'static/[name].[hash:7].[ext]'
      }
    }, ],
  },  
  //웹앱 전역 상수
  plugins: [   
     new webpack.DefinePlugin({
      DEPLOYED_BP_ADDRESS: JSON.stringify(fs.readFileSync('deployed_BP_Address', 'utf8').replace(/\n|\r/g, "")),
      DEPLOYED_BP_ABI: fs.existsSync('deployed_BP_ABI') && fs.readFileSync('deployed_BP_ABI', 'utf8'),
      DEPLOYED_PMS_ADDRESS: JSON.stringify(fs.readFileSync('deployed_PMS_Address', 'utf8').replace(/\n|\r/g, "")),
      DEPLOYED_PMS_ABI: fs.existsSync('deployed_PMS_ABI') && fs.readFileSync('deployed_PMS_ABI', 'utf8'),
     }),
    new CopyWebpackPlugin([{ from: "./src/login.html", to: "login.html"}]),
    new CopyWebpackPlugin([{ from: "./src/blank.html", to: "blank.html"}]),
    new CopyWebpackPlugin([{ from: "./src/blank2.html", to: "blank2.html"}]),
    new CopyWebpackPlugin([{ from: "./src/blank3.html", to: "blank3.html"}]),
    new CopyWebpackPlugin([{ from: "./src/css/sb-admin-2.min.css", to: "sb-admin-2.min.css"}]),
    new CopyWebpackPlugin([{ from: "./src/register.html", to: "register.html"}]),
    new CopyWebpackPlugin([{ from: "static", to: "static"}]),
    
    
  ],
  devServer: { 
    //contentBase: path.join(__dirname, "dist"), 
    compress: true ,
    port: 8080,
    historyApiFallback: {
      index: './src/login.html'
    }
  },
}