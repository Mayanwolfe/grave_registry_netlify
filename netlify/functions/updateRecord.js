const { createClient } = require('@supabase/supabase-js');
const ejs = require('ejs');
const path = require('path');
const cookie = require('cookie');
const querystring = require('querystring');

async function updateRecordInSupabase(supabase, formData) {
  try {
    const { data, error } = await supabase
            .from('grave_registry')
            .update(formData)
            .eq('ID', formData.ID );
    if (error) throw error;
  } catch (error) {
    console.error('Error updating record in Supabase:', error);
    throw error; // Rethrow the error to be handled by the calling function
  }
}

exports.handler = async function(event, context) {

    // Parse cookies from the request headers
  const cookies = cookie.parse(event.headers.cookie || '');
  const token = cookies.token;
    
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY, {
    global: {
    headers: {
        Authorization: `Bearer ${token}`
    }
    }
});


  if (!token) {
    const templatePath = path.resolve(__dirname, '../../public/views/login.ejs');
    const html = await ejs.renderFile(templatePath, {message: 'Session has timed out. Please log in again.'});
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  }

  const formData = querystring.parse(event.body);
  console.log(formData)

  try {
    await updateRecordInSupabase(supabase, formData);
    const templatePath = path.resolve(__dirname, '../../public/views/update.ejs');
    const html = await ejs.renderFile(templatePath, { record: null, message: `Record ${formData.ID} has been updated successfully.` });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  } catch (error) {
    console.error('Error updating record:', error);
    const templatePath = path.resolve(__dirname, '../../public/views/update.ejs');
    const html = await ejs.renderFile(templatePath, { record: null, message: 'Error Updating Record. Please try again.' });

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  }
};
