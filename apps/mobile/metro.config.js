// Metro config for a pnpm monorepo workspace.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.unstable_enableSymlinks = true;
// firebase v12 ships an "exports" map — Metro needs this to resolve it.
config.resolver.unstable_enablePackageExports = true;
// tsconfig `paths` are disabled for Metro (app.json experiments.tsconfigPaths),
// so the `@/*` alias is declared here for bundling. See tsconfig.json.
const srcRoot = path.resolve(projectRoot, 'src');
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = defaultResolveRequest ?? context.resolveRequest;
  if (moduleName.startsWith('@/')) {
    return resolve(context, path.join(srcRoot, moduleName.slice(2)), platform);
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
