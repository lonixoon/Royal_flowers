const fs = require('fs');

const wipeDependencies = () => {
  const file = fs.readFileSync('package.json');
  const content = JSON.parse(file);

  for (let devDep in content.devDependencies) {
    content.devDependencies[devDep] = '*';
  }

  for (let dep in content.dependencies) {
    content.dependencies[dep] = '*';
  }

  fs.writeFileSync('package.json', JSON.stringify(content));
};

if (require.main === module) {
  wipeDependencies();
} else {
  module.exports = wipeDependencies;
}
