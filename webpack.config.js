const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const isDev = process.env.NODE_ENV === "dev"
let config = {
    entry: {
        app: "./src/app.js",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js"
    },
    resolve: {
        extensions: ['.js', '.json']
    },
    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    },
    plugins: [
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false,
                    drop_debugger: true,
                    drop_console: true
                }
            }
        }),
        new HtmlWebpackPlugin({
            template: './src/temp.html'
        })
    ]
}
if (isDev) {
    config.devtool = 'eval-source-map'
    config.devServer = {
        hot: true,
        quiet: true,
        host: "localhost",
        port: 8888,
        overlay: {
            warnings: false,
            errors: true
        },
        watchOptions: {
            poll: false,
        }
    }
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.NamedModulesPlugin()
    )
    module.exports = new Promise((resolve, reject) => {
        portfinder.basePort = process.env.PORT || config.devServer.port
        portfinder.getPort((err, port) => {
            if (err) {
                reject(err)
            } else {
                process.env.PORT = port
                config.devServer.port = port
                config.plugins.push(new FriendlyErrorsPlugin({
                    compilationSuccessInfo: {
                        messages: [`Your application is running here: http://${config.devServer.host}:${port}`],
                    }
                }))
                resolve(config)
            }
        })
    })
}else{
	module.exports = config;
}
