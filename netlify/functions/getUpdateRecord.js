const { createClient } = require('@supabase/supabase-js');
const ejs = require('ejs');
const path = require('path');

//initialize connection to Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

//export function
exports.handler = async function (event, context) {

  const memorialID = event.queryStringParameters.memorialID;

  //Handle the user clicking "Search" without entering a value in the box
  if (!memorialID) {
    templatePath = path.resolve(__dirname, '../../public/views/update.ejs');
    templateData = { record: null, message: 'Enter a numeric value and try again.' };

    const html = await ejs.renderFile(templatePath, templateData);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  }

  //Set up query
  let query = supabase
    .from('grave_registry')
    .select(`
      ID,
      TITLE,
      SURNAME,
      FIRSTNAME,
      MIDDLE,
      MAIDEN,
      BIRTH_MONTH,
      BIRTH_DAY,
      BIRTH_YEAR,
      DEATH_MONTH,
      DEATH_DAY,
      DEATH_YEAR,
      AGE,
      SECTION,
      LOT,
      IS_VET,
      NOTES,
      MOVED_FROM,
      MOVED_TO
    `)
    .eq('ID', memorialID);

  //Execute query and handle errors
  try {
    let { data, error } = await query;
    if (error) {
      throw error;
    }

    //ID should always be unique, BUT ensure we always get only one record
    let dataObject = data[0];
    let templatePath;
    let templateData;

    //if there's a matching record, get it and display it, else ask the user to try again.
    if (dataObject) {
      templatePath = path.resolve(__dirname, '../../public/views/update.ejs');
      templateData = { record: dataObject, message: null };
    } else {
      templatePath = path.resolve(__dirname, '../../public/views/update.ejs');
      templateData = { record: null, message: 'No matching record found. Please check the value and try again.' };
    }

    //Render the EJS as HTML
    const html = await ejs.renderFile(templatePath, templateData);

    //Send the EJS to the browser as HTML
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
