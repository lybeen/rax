const webpack = require('webpack');
const Chain = require('webpack-chain');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const { getBabelConfig, setBabelAlias } = require('rax-compile-config');

const babelConfig = getBabelConfig({
  styleSheet: true
});

module.exports = (context) => {
  const { rootDir } = context;

  const config = new Chain();

  config.target('web');
  config.context(rootDir);

  setBabelAlias(config);

  config.resolve.extensions
    .merge(['.js', '.json', '.jsx', '.html', '.ts', '.tsx']);

  config.resolve.alias
    .set('@core/app', 'universal-app-runtime')
    .set('@core/page', 'universal-app-runtime')
    .set('@core/router', 'universal-app-runtime');

  // external weex module
  config.externals([
    function(ctx, request, callback) {
      if (request.indexOf('@weex-module') !== -1) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    }
  ]);

  config.module.rule('css')
    .test(/\.css?$/)
    .use('css')
      .loader(require.resolve('stylesheet-loader'));

  config.module.rule('jsx')
  .test(/\.(js|mjs|jsx)$/)
  .exclude
    .add(/(node_modules|bower_components)/)
    .end()
  .use('babel')
    .loader(require.resolve('babel-loader'))
    .options(babelConfig);

  config.module.rule('tsx')
  .test(/\.(ts|tsx)?$/)
  .exclude
    .add(/(node_modules|bower_components)/)
    .end()
  .use('babel')
    .loader(require.resolve('babel-loader'))
    .options(babelConfig)
    .end()
  .use('ts')
    .loader(require.resolve('ts-loader'));

  config.module.rule('assets')
    .test(/\.(svg|png|webp|jpe?g|gif)$/i)
    .use('source')
      .loader(require.resolve('image-source-loader'));

  config.plugin('caseSensitivePaths')
    .use(CaseSensitivePathsPlugin);

  config.plugin('noError')
    .use(webpack.NoEmitOnErrorsPlugin);

  return config;
};
