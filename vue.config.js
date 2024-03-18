// 获取node命令中的参数
const args = process.argv.slice(2);
const buildMode = args[args.length - 1];
const baseBuildConfig = {
  transpileDependencies: true,
};

const packageLibBuildConfig = {
  productionSourceMap: false,
  configureWebpack: {
    output: {
      filename: "[name].js",
      library: "virtualSelect",
      libraryTarget: "umd",
      libraryExport: "default",
    },
    externals: {
      "ant-design-vue": "ant-design-vue",
      "@ant-design": "@ant-design",
      vue: "vue",
    },
  },
};

const packageEsBuildConfig = {
  productionSourceMap: false,
  configureWebpack: {
    output: {
      module: true,
      libraryTarget: "commonjs",
      // library: {
      //   type: "module",
      // },
    },
    experiments: {
      outputModule: true,
    },
    externals: {
      vue: "Vue",
      "ant-design-vue": "ant-design-vue",
      "@ant-design": "@ant-design",
    },
  },
  chainWebpack: (config) => {
    config.optimization.minimize(false);
  },
};

module.exports =
  buildMode === "build"
    ? baseBuildConfig
    : buildMode === "lib"
    ? packageLibBuildConfig
    : packageEsBuildConfig;
