const ejs = require('ejs');
const path = require('path');

exports.handler = async function(event, context) {
  try {

    //retrieve page to render
    const templatePath = path.resolve(__dirname, '../../public/views/index.ejs');
    const html = await ejs.renderFile(templatePath, { records: null });

    //return page from function
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };

    //handle failure
  } catch (error) {
    console.error('Error rendering index.ejs:', error.message);
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};
