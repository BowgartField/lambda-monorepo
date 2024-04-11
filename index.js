const core = require('@actions/core');
const fs = require('fs');
const YAML = require('yaml');
const shell = require('shelljs');

const deployAll = ({ lambdaFunctions, yml, zipParams, alias, layer }) => {
  let success = true;
  for (const [key, value] of Object.entries(lambdaFunctions)) {
    if (value === 'true') {
      console.log(yml[key][0].split('*')[0])
      const { code } = shell.exec(`sh ./deploy.sh "${key}" "${yml[key][0].split('*')[0]}" "${zipParams}" "${alias}" "${layer}"`);
      if (code) {
        console.error(`Deployment of ${key} failed!`);
        success = false;
      }
    }else{
      console.log(`Skipping deployment of ${key}`);
    }
  }
  return success;
};

const run = async () => {
  try {
    const lambdaFunctions = core.getInput('lambda-functions');
    const zipParams = core.getInput('zip-params');
    const alias = core.getInput('alias-name');
    const layer = core.getInput('layer-name');
    const filterFilePath = core.getInput('filter-file-path') ?? './.github/filters.yml';
    const file = fs.readFileSync(filterFilePath, 'utf8');
    const yml = YAML.parse(file);

    const success = deployAll({ lambdaFunctions, yml, zipParams, alias, layer });
    if (!success) throw new Error('An error occured. At least one Lambda could not be deployed.');
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
};

if (require.main === module) {
  run();
}

module.exports = run;
