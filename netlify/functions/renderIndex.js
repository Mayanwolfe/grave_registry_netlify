const ejs = require('ejs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    const templatePath = path.resolve(__dirname, '../views/index.ejs');
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
