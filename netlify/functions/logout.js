const cookie = require('cookie');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  const headers = {
    'Set-Cookie': cookie.serialize('authenticated', '', {
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
