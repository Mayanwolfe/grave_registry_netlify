const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

exports.handler = async function(event, context) {
  try {
    const templatePath = path.resolve(__dirname, '../../public/views/index.ejs');
    console.log(`Resolved template path: ${templatePath}`);
    
    // Check if the file exists
    if (!fs.existsSync(templatePath)) {
      console.error('Template file does not exist at the resolved path.');
      return {
        statusCode: 500,
        body: 'Internal Server Error: Template file not found.'
      };
    }

    const html = await ejs.renderFile(templatePath, { records: null });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  } catch (error) {
    console.error('Error rendering index.ejs:', error.message);
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};
