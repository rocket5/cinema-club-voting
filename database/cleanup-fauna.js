/**
 * Script to remove FaunaDB dependencies once the migration to Supabase is complete
 * 
 * Usage: node cleanup-fauna.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths to clean up
const faunaDir = path.join(__dirname, '..', 'src', 'lib', 'fauna');
const faunaSchema = path.join(__dirname, '..', 'fauna-schema.gql');

// Function to remove a directory or file
const remove = (pathToRemove) => {
  if (!fs.existsSync(pathToRemove)) {
    console.log(`${pathToRemove} does not exist, skipping...`);
    return;
  }
  
  console.log(`Removing ${pathToRemove}...`);
  
  const stat = fs.statSync(pathToRemove);
  
  if (stat.isDirectory()) {
    // Remove directory recursively
    fs.rmSync(pathToRemove, { recursive: true, force: true });
  } else {
    // Remove file
    fs.unlinkSync(pathToRemove);
  }
  
  console.log(`Removed ${pathToRemove}`);
};

// Function to update package.json to remove FaunaDB dependencies
const updatePackageJson = () => {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  console.log(`Updating ${packageJsonPath}...`);
  
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Remove FaunaDB dependencies
  if (packageJson.dependencies && packageJson.dependencies.fauna) {
    delete packageJson.dependencies.fauna;
    console.log('Removed fauna dependency');
  }
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  
  console.log(`Updated ${packageJsonPath}`);
};

// Start cleanup
console.log('Starting FaunaDB cleanup...');

// Remove FaunaDB directory and schema
remove(faunaDir);
remove(faunaSchema);

// Update package.json
updatePackageJson();

// Run npm install to update node_modules
console.log('Running npm install to update node_modules...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('npm install completed successfully');
} catch (error) {
  console.error('Error running npm install:', error);
}

console.log('Done!');
console.log('\nFaunaDB has been removed from the project.');
console.log('Please make sure all functionality is working correctly with Supabase before deploying to production.'); 