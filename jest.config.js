/**
 * Jest configuration file
 * This configures Jest to work with our React application
 */
module.exports = {
  // The root directory that Jest should scan for tests and modules
  rootDir: '.',
  
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost',
    customExportConditions: ['node', 'node-addons']
  },
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.js',
    '<rootDir>/src/**/*.test.js'
  ],
  
  // File extensions Jest will look for
  moduleFileExtensions: ['js', 'jsx', 'json'],
  
  // Module name mapper to handle CSS and image imports
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/tests/mocks/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/tests/mocks/fileMock.js'
  },
  
  // Setup files to run before each test
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.js'],
  
  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // Collect coverage information
  collectCoverage: false,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/src/tests/'
  ]
}; 