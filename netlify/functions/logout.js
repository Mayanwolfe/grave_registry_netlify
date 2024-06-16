//Used to validate loggeed-in users
const cookie = require('cookie');

exports.handler = async function (event, context) {
  //Get the existing cookie from the header
  const cookies = cookie.parse(event.headers.cookie || '');
  //Get the token from the cookie object
  const token = cookies.token;

  //Modify the headers to force expiration of the cookie
  const headers = {
    'Set-Cookie': cookie.serialize('token', token, {
      httpOnly: true,
      maxAge: -1, // Expire the cookie immediately
      sameSite: 'strict',
      path: '/'
    })
  };

  return {
    statusCode: 302,
    headers: {
      ...headers,
      'Location': '/' // Redirect to the home page
    },
    body: 'Redirecting...'
  };
};
