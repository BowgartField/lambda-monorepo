const core = require('@actions/core');
const fs = require('fs');
const YAML = require('yaml');
const shell = require('shelljs');

const deployAll = ({ functions, yml, zipParams, alias, layer }) => {
  let success = true;
  const { code } = shell.exec(`sh ./deploy.sh "${functions}" "packages/${functions}" "${zipParams}" "${alias}" "${layer}"`);
  if (code) {
    console.error(`Deployment of ${key} failed!`);
    success = false;
  }
  return success;
};

const run = async () => {
  try {
    const lambdaFunctions = core.getInput('lambda-functions');
    const zipParams = core.getInput('zip-params');
    const alias = core.getInput('alias-name');
    const layer = core.getInput('layer-name');
    const file = fs.readFileSync('./.github/filters.yml', 'utf8');
    const yml = YAML.parse(file);

    const success = deployAll({ lambdaFunctions, yml, zipParams, alias, layer });
    if (!success) throw new Error('An error occured. At least one Lambda could not be deployed.');
  } catch (error) {
    core.setFailed(error.message);
  }
};

if (require.main === module) {
  run();
}

module.exports = run;
