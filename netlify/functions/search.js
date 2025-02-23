const { createClient } = require('@supabase/supabase-js');
const ejs = require('ejs');
const path = require('path');

//connect to Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

exports.handler = async function (event, context) {

  //Destructuring assignment of variables based on the GET query object 
  const { lastName, firstName, maidenName, birthYear, deathYear } = event.queryStringParameters;

  //console.log(event)

  //build the query
  let query = supabase
    .from('grave_register_formatted_2')
    .select(`
      memorial_id,
      prefix,
      last_name,
      first_name,
      middle_name,
      maiden_name,
      suffix,
      birth_date,
      death_date,
      age_sane,
      section,
      lot,
      is_vet,
      notes,
      moved_from,
      moved_to
    `)
    .order('last_name', { ascending: true }); //Order by last name in A-Z order

  //Add optional elements to the query, based on the fields the user submitted
  if (lastName) query = query.ilike('last_name', `%${lastName}%`); //fuzzy match
  if (firstName) query = query.ilike('first_name', `%${firstName}%`); //fuzzy match
  if (maidenName) query = query.ilike('maiden_name', `%${maidenName}%`); //fuzzy match
  if (birthYear) query = query.eq('birth_year', birthYear); //exact match
  if (deathYear) query = query.eq('death_year', deathYear); //exact match

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
