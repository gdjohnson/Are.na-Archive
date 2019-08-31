const path = require('path');

module.exports = {
    context: __dirname,
    entry: './browser.js',
    output: {
        path: path.join(__dirname),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '*']
    },
    devtool: "eval-source-map",
    target: 'node', 
    externals: {
        "request": "request" 
    },
}