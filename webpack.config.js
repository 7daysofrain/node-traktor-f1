const path = require("path")

module.exports = {
    target: "node",
    entry: path.resolve(__dirname, "lib/traktor_f1.js"),
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "index_bundle.js",
        library: "$",
        libraryTarget: "umd",
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: "babel-loader",
            },
        ],
    },
    mode: "development",
}
