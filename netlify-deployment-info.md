# Netlify Deployment Information
- The project is configured for Netlify deployment with a netlify.toml file in the root directory
- The build command is set to "npm run build" and the publish directory is "build"
- Netlify functions are stored in the "netlify/functions" directory
- The project uses redirects to handle client-side routing with React Router
- The site is deployed at https://cinemaclub-ai.netlify.app
- Deployment can be done using the Netlify CLI with the command "netlify deploy --prod"
- It's important to run "npm run build" before deploying to ensure the latest changes are included
