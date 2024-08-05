const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { DefinePlugin } = require("webpack");
const srcDir = path.join(__dirname, "..", "src");
require("dotenv").config({ path: "./.env" });

module.exports = {
  entry: {
    popup: path.join(srcDir, "popup.tsx"),
    content_script: path.join(srcDir, "content_script.tsx"),
  },
  output: {
    path: path.join(__dirname, "../dist/js"),
    publicPath: "",
    filename: "[name].js",
    assetModuleFilename: "../assets/[hash][ext][query]",
  },
  optimization: {
    splitChunks: {
      name: "vendor",
      chunks(chunk) {
        return chunk.name !== "background";
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.mp3$/,
        type: "asset/resource",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: ".", to: "../", context: "public" }],
      options: {},
    }),
    new DefinePlugin({
      "process.env.AWS_ACCESS_KEY_ID": JSON.stringify(process.env.AWS_ACCESS_KEY_ID),
      "process.env.AWS_SECRET_ACCESS_KEY": JSON.stringify(process.env.AWS_SECRET_ACCESS_KEY),
    }),
  ],
};
