const { createClient } = require('@supabase/supabase-js');
const ejs = require('ejs');
const path = require('path');
//Used to validate logged-in users
const cookie = require('cookie');
//Used to parse POST requests
const querystring = require('querystring');

async function updateRecordInSupabase(supabase, formData) {
  try {
    const recordId = formData.memorial_id;

    // Fetch the current record from the database to compare against submission
    const { data: currentData, error: fetchError } = await supabase
      .from('grave_register')
      .select('*')
      .eq('memorial_id', recordId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Construct the update payload with only changed fields by comparing against old record
    const updatePayload = {};
    for (const key in formData) {
      if (formData[key] !== String(currentData[key]) && key !== 'memorial_id') {
        updatePayload[key] = formData[key]
      }
    }

    console.log('Update payload:', updatePayload);

    if (Object.keys(updatePayload).length === 0) {
      return { message: 'No fields were changed', data: currentData };
    }

    // Perform the update with the constructed payload
    const { data, error: updateError } = await supabase
      .from('grave_register')
      .update(updatePayload)
      .eq('memorial_id', recordId);

    if (updateError) {
      throw updateError;
    }
    return data;
  } catch (error) {
    console.error('Error updating record in Supabase:', error);
    throw error;
  }
}

exports.handler = async function (event, context) {

  // Parse cookies from the request headers
  const cookies = cookie.parse(event.headers.cookie || '');
  const token = cookies.token;

  //Add the token to the supabase headers to authenticate against DB policy
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  //If the token has expired, send the user back to the login page
  if (!token) {
    const templatePath = path.resolve(__dirname, '../../public/views/login.ejs');
    const html = await ejs.renderFile(templatePath, { message: 'Session has timed out. Please log in again.' });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  }

  //Get the update information from the POST request
  const formData = querystring.parse(event.body);

  try {
    recordId = formData.memorial_id
    //Try to update the database (see function definition)
    await updateRecordInSupabase(supabase, formData);

    //If it worked, show the record ID to the user
    const templatePath = path.resolve(__dirname, '../../public/views/update.ejs');
    const html = await ejs.renderFile(templatePath, { record: null, message: `Record ${recordId} has been updated successfully.` });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  } catch (error) {

    //If it didn't work, show a friendly error message to the user.
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
