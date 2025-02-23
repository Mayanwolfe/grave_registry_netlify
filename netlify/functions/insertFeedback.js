const { createClient } = require('@supabase/supabase-js');
const ejs = require('ejs');
const path = require('path');

//connect to Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

exports.handler = async function (event, context) {

  try { 
  //Destructuring assignment of variables based on the POST query object 
  const formData = querystring.parse(event.body);

  // INSERT INTO user_reports (report_type, report_body) VALUES (formData)

  const { data, error } = await supabase
  .from('user_reports')
  .insert(formData)

  //If it worked, show a success message to the user
      const templatePath = path.resolve(__dirname, '../../public/views/feedback.ejs');
      const html = await ejs.renderFile(templatePath, { message: `Feedback successfully submitted. Thank you for your input` });
  
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: html
      };

  } catch (error) {
  
      //If it didn't work, show a friendly error message to the user.
      console.error(error);
      const templatePath = path.resolve(__dirname, '../../public/views/feedback.ejs');
      const html = await ejs.renderFile(templatePath, { message: 'Error submitting feedback, please try again.' });
  
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'text/html' },
        body: html
      };
    }

}