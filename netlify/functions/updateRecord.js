const { createClient } = require('@supabase/supabase-js');
const ejs = require('ejs');
const path = require('path');
const cookie = require('cookie');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

async function updateRecordInSupabase(formData) {
  try {
    const recordId = formData.ID;
    delete formData.ID; // Remove the unique identifier to prevent updating it
    const { data, error } = await supabase
      .from('grave_registry')
      .update(formData)
      .eq('ID', recordId);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating record in Supabase:', error);
    throw error; // Rethrow the error to be handled by the calling function
  }
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  // Parse cookies from the request headers
  const cookies = cookie.parse(event.headers.cookie || '');
  const authenticated = cookies.authenticated === 'true';

  if (!authenticated) {
    const templatePath = path.resolve(__dirname, '../views/login.ejs');
    const html = await ejs.renderFile(templatePath, {});
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  }

  const formData = JSON.parse(event.body);

  try {
    await updateRecordInSupabase(formData);

    const templatePath = path.resolve(__dirname, '../views/update.ejs');
    const html = await ejs.renderFile(templatePath, { record: null, message: 'Record Updated Successfully' });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  } catch (error) {
    console.error('Error updating record:', error);
    const templatePath = path.resolve(__dirname, '../views/update.ejs');
    const html = await ejs.renderFile(templatePath, { record: null, message: 'Error Updating Record. Please try again.' });

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  }
};
