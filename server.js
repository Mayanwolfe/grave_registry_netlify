// server.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config()
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', './views'); // Specify the directory where EJS templates are located
app.use(session({
    secret: 'your secret key', // Use a secret key for your session
    resave: false,
    saveUninitialized: true,
    cookie: { 
      maxAge: 600000 // 10 minutes in milliseconds
    }
  }));

// Serve the main search form
app.get('/', (req, res) => {
    res.render('index', { records: null });
});

app.get('/loginPage', (req, res) => {
    res.render('login');
});

app.get('/updatePage', (req, res) => {
    if (req.session.authenticated) {
        res.render('update', { record: null, message: null});
    } else {
        res.render('login')
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(username + " " + password)

    let { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
    });

    if (error) {
        console.error('Login error', error.message);
        return res.status(401).send('Login failed. Please try again or contact a library administrator.');
    }

    // Store user information in session
    req.session.userId = 'admin'
    req.session.authenticated = true;

    res.redirect('/updatePage');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error', err);
            return res.status(500).send('Could not log out, please try again');
        }

        res.redirect('/'); // Redirect to the home page or login page after logging out
    });
});


// Handle search requests
app.get('/search', async (req, res) => {
  const { lastName, firstName, birthYear, deathYear } = req.query;

  let query = supabase
      .from('grave_register')
      .select(`
          name_last,
          name_maiden,
          name_first,
          name_middle,
          title,
          birth_date,
          death_date,
          age,
          is_veteran,
          section,
          lot,
          moved_from,
          moved_to_lot,
          notes
      `)
      .order('name_last', { ascending: true });

  if (lastName) {
      query = query.ilike('name_last', `%${lastName}%`);
  }
  if (firstName) {
      query = query.ilike('name_first', `%${firstName}%`);
  }
  if (birthYear) {
      query = query.eq('birth_year', birthYear);
  }
  if (deathYear) {
      query = query.eq('death_year', deathYear);
  }

  try {
      let { data, error } = await query;
      if (error) {
          throw error;
      }
      console.log(data)
      res.render('index', { records: data });
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/getUpdateRecord', async (req, res) => {
    const memorialID = req.query.memorialID;
    //console.log(memorialID)
  
    let query = supabase
        .from('grave_register')
        .select(`
            memorial_ID,
            name_last,
            name_maiden,
            name_first,
            name_middle,
            title,
            birth_date,
            death_date,
            age,
            is_veteran,
            section,
            lot,
            moved_from,
            moved_to_lot,
            notes
        `)
        .eq('memorial_ID', memorialID);
  
    try {
        let { data, error } = await query;
        if (error) {
            throw error;
        }
        let dataObject = data[0]
        if (dataObject) {
            res.render('update', { record: dataObject })
        } else {
            res.render('update', { record: null, message: 'No matching record found. Please check the value and try again.' })
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
  });

  app.post('/updateRecord', async (req, res) => {
    if (req.session.authenticated) {
    try {
        // Call the function to update the record in Supabase
        const updatedData = await updateRecordInSupabase(req.body);
        res.render('update', {record: null, message: 'Record Updated Successfully' })
    } catch (error) {
        console.error('Error updating record:', error);
        res.render('update', {record: null, message: 'Error Updating Record. Please try again.' })
    }
    } else {
        res.render('login')
    }
});

async function updateRecordInSupabase(formData) {
    try {
        const recordId = formData.memorial_ID;
        delete formData.memorial_ID; // Remove the unique identifier to prevent updating it
        const { data, error } = await supabase
            .from('grave_register')
            .update(formData)
            .eq('memorial_ID', recordId );
        if (error) throw error;
    } catch (error) {
        console.error('Error updating record in Supabase:', error);
        throw error; // Rethrow the error to be handled by the calling function
    }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});