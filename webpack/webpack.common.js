const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const srcDir = path.join(__dirname, '..', 'src');

module.exports = {
	entry: {
		popup: path.join(srcDir, 'popup.tsx'),
		options: path.join(srcDir, 'options.tsx'),
		content_script: path.join(srcDir, 'content_script.tsx')
	},
	output: {
		path: path.join(__dirname, '../dist/js'),
		publicPath: '',
		filename: '[name].js',
		assetModuleFilename: '../assets/[hash][ext][query]'
	},
	optimization: {
		splitChunks: {
			name: 'vendor',
			chunks(chunk) {
				return chunk.name !== 'background';
			}
		}
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.mp3$/,
				type: 'asset/resource'
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			}

		]
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	},
	plugins: [
		new CopyPlugin({
			patterns: [{ from: '.', to: '../', context: 'public' }],
			options: {}
		})
	]
};
