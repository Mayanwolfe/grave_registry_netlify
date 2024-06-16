const { createClient } = require('@supabase/supabase-js');
const ejs = require('ejs');
const path = require('path');
const cookie = require('cookie');

async function updateRecordInSupabase(supabase, formData) {
  try {
    console.log('formData', formData)
    const recordId = formData.ID;
    delete formData.ID; // Remove the unique identifier to prevent updating it
    const { data, error } = await supabase
            .from('grave_registry')
            .update(formData)
            .eq('ID', recordId );
    if (error) throw error;
    console.log(data)
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
    const html = await ejs.renderFile(templatePath, {});
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  }

  const formData = event.queryStringParameters

  try {
    await updateRecordInSupabase(supabase, formData);

    const templatePath = path.resolve(__dirname, '../../public/views/update.ejs');
    const html = await ejs.renderFile(templatePath, { record: null, message: 'Record Updated Successfully' });

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
