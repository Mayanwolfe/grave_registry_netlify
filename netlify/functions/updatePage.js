const ejs = require('ejs');
const path = require('path');
const cookie = require('cookie');

exports.handler = async function(event, context) {
  try {
    // Parse cookies from the request headers
    const cookies = cookie.parse(event.headers.cookie || '');
    const token = cookies.token;

    // Determine the template to render based on authentication status
    let templatePath;
    let data;

    if (token) {
      templatePath = path.resolve(__dirname, '../../public/views/update.ejs');
      data = { record: null, message: null };
    } else {
      templatePath = path.resolve(__dirname, '../../public/views/login.ejs');
      data = {message: null};
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
