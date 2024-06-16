const { createClient } = require('@supabase/supabase-js');
const ejs = require('ejs');
const path = require('path');
const cookie = require('cookie');
const querystring = require('querystring');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

exports.handler = async function(event, context) {
  console.log(event)
  const { username, password } = querystring.parse(event.body);

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

  const token = data.session.access_token;
  const headers = {
    'Set-Cookie': cookie.serialize('token', token, {
      httpOnly: true,
      maxAge: 600, // 10 minutes
      sameSite: 'strict',
      path: '/'
    })
  };


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
