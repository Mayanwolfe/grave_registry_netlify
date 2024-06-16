const cookie = require('cookie');

exports.handler = async function(event, context) {
    const cookies = cookie.parse(event.headers.cookie || '');
    const token = cookies.token;

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
