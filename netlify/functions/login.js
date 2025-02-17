const { createClient } = require('@supabase/supabase-js');
const ejs = require('ejs');
const path = require('path');
//Used to validate logged-in users
const cookie = require('cookie');
//Used to parse POST requests
const querystring = require('querystring');


//initialize connection to Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

//Export Function
exports.handler = async function (event, context) {

  //Get login information from POST request - using querystring because we aren't passing login info in the URL
  const { username, password } = querystring.parse(event.body);

  //Use Supabase's built-in authentication to log in and permit write access to the DB. Also provides a token to use later.
  let { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@cottage.com',
    password: password,
  });

  //If wrong password, reload login and tell the user.
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

  //Grab the token from the data passed back from Supabase on successful login
  const token = data.session.access_token;

  //Add the token to the header for use in the Update functions
  const headers = {
    'Set-Cookie': cookie.serialize('token', token, {
      httpOnly: true,
      maxAge: 600, // 10 minute timer before expiration
      sameSite: 'strict',
      path: '/'
    })
  };

  //Let the user pass through to the Update page
  const templatePath = path.resolve(__dirname, '../../public/views/update.ejs');
  const html = await ejs.renderFile(templatePath, { record: null, message: null });

  //Return the Update page as as HTML, plus the additional Session information and token.
  return {
    statusCode: 200,
    headers: {
      ...headers,
      'Content-Type': 'text/html'
    },
    body: html
  };
};
