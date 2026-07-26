/**
 * Webpack (CRA 5) fails on @mui/material v6 styles barrel:
 *   export { default as createTheme, createMuiTheme } from "./createTheme.js"
 * because createMuiTheme is only a nested re-export from createTheme.js.
 * Split the export so createMuiTheme is taken from createThemeNoVars.js.
 * Safe no-op if already patched or if MUI drops the deprecated export.
 */
const fs = require('fs');
const path = require('path');

const stylesIndex = path.join(
  __dirname,
  '..',
  'node_modules',
  '@mui',
  'material',
  'styles',
  'index.js'
);

const BROKEN =
  'export { default as createTheme, createMuiTheme } from "./createTheme.js";';
const FIXED = [
  'export { default as createTheme } from "./createTheme.js";',
  'export { createMuiTheme } from "./createThemeNoVars.js";',
].join('\n');

function fixMuiCreateThemeExport() {
  if (!fs.existsSync(stylesIndex)) {
    return;
  }
  const content = fs.readFileSync(stylesIndex, 'utf8');
  if (!content.includes(BROKEN)) {
    return;
  }
  fs.writeFileSync(stylesIndex, content.replace(BROKEN, FIXED), 'utf8');
}

module.exports = { fixMuiCreateThemeExport };

if (require.main === module) {
  fixMuiCreateThemeExport();
}
