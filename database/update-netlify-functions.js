/**
 * Script to ensure all Netlify functions use Supabase correctly
 * 
 * Usage: node database/update-netlify-functions.js
 */

const fs = require('fs');
const path = require('path');

// Directory containing Netlify functions
const functionsDir = path.join(__dirname, '..', 'netlify', 'functions');
// Directory containing Supabase service files
const supabaseDir = path.join(__dirname, '..', 'src', 'lib', 'supabase');

// Function to update a Netlify function file
const updateNetlifyFunction = (filePath) => {
  console.log(`Checking ${filePath}...`);
  
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Ensure Supabase imports are correct
  const hasCorrectImports = content.includes("require('../../src/lib/supabase/");
  
  if (!hasCorrectImports) {
    console.log(`Updating imports in ${filePath}...`);
    // Update any remaining incorrect imports
    content = content.replace(
      /require\(['"]\.\.\/\.\.\/src\/lib\/([^\/]+)\/([^'"]+)['"]\)/g,
      "require('../../src/lib/supabase/$2')"
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`${filePath} already has correct imports`);
  }
};

// Function to check and update Supabase service files to use CommonJS syntax
const updateSupabaseService = (filePath) => {
  console.log(`Checking ${filePath} for ES modules syntax...`);
  
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file uses ES modules syntax
  const usesImport = content.includes('import ');
  const usesExport = content.includes('export ');
  
  if (usesImport || usesExport) {
    console.log(`Converting ${filePath} from ES modules to CommonJS...`);
    
    // Replace import statements with require
    content = content.replace(
      /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g,
      'const { $1 } = require(\'$2\')'
    );
    
    // Replace export statements with module.exports
    content = content.replace(
      /export\s+\{\s*([^}]+)\s*\}/g,
      'module.exports = { $1 }'
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`Converted ${filePath} to CommonJS syntax`);
  } else {
    console.log(`${filePath} already uses CommonJS syntax`);
  }
};

// Process all JavaScript files in the functions directory
const processNetlifyFunctions = (dir) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      processNetlifyFunctions(filePath);
    } else if (file.endsWith('.js')) {
      // Update JavaScript files
      updateNetlifyFunction(filePath);
    }
  });
};

// Process all JavaScript files in the Supabase directory
const processSupabaseServices = (dir) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      processSupabaseServices(filePath);
    } else if (file.endsWith('.js')) {
      // Check and update JavaScript files
      updateSupabaseService(filePath);
    }
  });
};

// Start processing
console.log('Checking Netlify functions for correct Supabase imports...');
processNetlifyFunctions(functionsDir);
console.log('Done!');

console.log('\nChecking Supabase service files for ES modules syntax...');
processSupabaseServices(supabaseDir);
console.log('Done!');

// Instructions for manual verification
console.log('\nPlease manually verify the updated files to ensure they work correctly.');
console.log('Some files may need additional changes beyond simple replacements.');
console.log('\nNext steps:');
console.log('1. Test each function to ensure it works with Supabase');
console.log('2. Check for any remaining issues in the browser console'); 