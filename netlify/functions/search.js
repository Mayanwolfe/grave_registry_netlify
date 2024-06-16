const { createClient } = require('@supabase/supabase-js');
const ejs = require('ejs');
const path = require('path');

//connect to Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

exports.handler = async function (event, context) {

  //Destructuring assignment of variables based on the GET query object 
  const { lastName, firstName, birthYear, deathYear } = event.queryStringParameters;

  //build the query
  let query = supabase
    .from('grave_registry')
    .select(`
      ID,
      TITLE,
      SURNAME,
      FIRSTNAME,
      MIDDLE,
      MAIDEN,
      BIRTH_YEAR,
      BIRTH_MONTH,
      BIRTH_DAY,
      DEATH_YEAR,
      DEATH_MONTH,
      DEATH_DAY,
      AGE,
      SECTION,
      LOT,
      IS_VET,
      NOTES,
      MOVED_FROM,
      MOVED_TO
    `)
    .order('SURNAME', { ascending: true }); //Order by last name in A-Z order

  //Add optional elements to the query, based on the fields the user submitted
  if (lastName) query = query.ilike('SURNAME', `%${lastName}%`); //fuzzy match
  if (firstName) query = query.ilike('FIRSTNAME', `%${firstName}%`); //fuzzy match
  if (birthYear) query = query.eq('BIRTH_YEAR', birthYear); //exact match
  if (deathYear) query = query.eq('DEATH_YEAR', deathYear); //exact match

  try {
    //try the query against the DB
    let { data, error } = await query;
    if (error) throw error;

    //Pass through the search result(s) and rerender the EJS as HTML
    const templatePath = path.resolve(__dirname, '../../public/views/index.ejs');
    const html = await ejs.renderFile(templatePath, { records: data });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};
