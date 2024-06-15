const ejs = require('ejs');
const path = require('path');
const cookie = require('cookie');

exports.handler = async function(event, context) {
  try {
    // Parse cookies from the request headers
    const cookies = cookie.parse(event.headers.cookie || '');
    const authenticated = cookies.authenticated === 'true';

    // Determine the template to render based on authentication status
    let templatePath;
    let data;

    if (authenticated) {
      templatePath = path.resolve(__dirname, '../../public/views/update.ejs');
      data = { record: null, message: null };
    } else {
      templatePath = path.resolve(__dirname, '../../public/views/login.ejs');
      data = {};
    }

    // Render the appropriate template
    const html = await ejs.renderFile(templatePath, data);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  } catch (error) {
    console.error('Error rendering template:', error.message);
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};
