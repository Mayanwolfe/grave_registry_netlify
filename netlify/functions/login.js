const { createClient } = require('@supabase/supabase-js');
const ejs = require('ejs');
const path = require('path');
const cookie = require('cookie');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  console.log(event.queryStringParameters)
  const { username, password } = event.queryStringParameters;
  console.log(username, password)

  let { data, error } = await supabase.auth.signInWithPassword({
    email: username,
    password: password,
  });

  if (error) {
    console.error('Login error', error.message);
    const templatePath = path.resolve(__dirname, '../../public/views/login.ejs');
    const html = await ejs.renderFile(templatePath, { message: 'Login failed. Please try again or contact a library administrator.' });

    return {
      statusCode: 401,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  }

  const headers = {
    'Set-Cookie': cookie.serialize('authenticated', 'true', {
      httpOnly: true,
      maxAge: 600, // 10 minutes
      sameSite: 'strict',
      path: '/'
    })
  };

  console.log(headers)

  const templatePath = path.resolve(__dirname, '../../public/views/update.ejs');
  const html = await ejs.renderFile(templatePath, { record: null, message: null });

  return {
    statusCode: 200,
    headers: {
      ...headers,
      'Content-Type': 'text/html'
    },
    body: html
  };
};
