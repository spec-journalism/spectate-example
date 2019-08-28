const fs = require('fs');
const path = require('path');
const Bundler = require('parcel-bundler');
require('dotenv').config();

const LOCALS_FILLER_STR = 'BODY_LOCALS';
const PH_CONFIG = `{
  "plugins": {
    "posthtml-include": {
      "root": "./src"
    },
    "posthtml-expressions": {
      "root": "./src/partials",
      "locals": ${LOCALS_FILLER_STR}
    }
  }
}`;

(async function() {

  // Initialize bundler
  const bundler = new Bundler(path.join(__dirname, './src/index.html'));

  // Every time bundler starts, update doc content
  bundler.on('buildStart', () => {
    const doc = {
      ...JSON.parse(fs.readFileSync('./data/doc.json', 'utf8')),
      docUrl: process.env.DOC_URL,
    };
    const oldConfig = fs.readFileSync('.posthtmlrc').toString();

    // Generate new posthtml config from doc.json; update the old one if necessary
    const phConfig = PH_CONFIG.replace(LOCALS_FILLER_STR, JSON.stringify(doc));
    if (phConfig !== oldConfig)
      fs.writeFileSync('.posthtmlrc', phConfig);
  });

  // Run the bundler and start the server
  bundler.serve();
})();
