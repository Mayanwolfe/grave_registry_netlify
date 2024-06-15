const { createClient } = require('@supabase/supabase-js');
const ejs = require('ejs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  const memorialID = event.queryStringParameters.memorialID;

  let query = supabase
    .from('grave_registry')
    .select(`
      ID,
      TITLE,
      SURNAME,
      FIRSTNAME,
      MIDDLE,
      MAIDEN,
      BIRTH_YEAR,
      BIRTH_MONTH,
      BIRTH_DAY,
      DEATH_YEAR,
      DEATH_MONTH,
      DEATH_DAY,
      AGE,
      SECTION,
      LOT,
      IS_VET,
      NOTES,
      MOVED_FROM,
      MOVED_TO
    `)
    .eq('ID', memorialID);

  try {
    let { data, error } = await query;
    if (error) {
      throw error;
    }
    let dataObject = data[0];
    let templatePath;
    let templateData;

    if (dataObject) {
      templatePath = path.resolve(__dirname, '../views/update.ejs');
      templateData = { record: dataObject, message: null };
    } else {
      templatePath = path.resolve(__dirname, '../views/update.ejs');
      templateData = { record: null, message: 'No matching record found. Please check the value and try again.' };
    }

    const html = await ejs.renderFile(templatePath, templateData);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};
