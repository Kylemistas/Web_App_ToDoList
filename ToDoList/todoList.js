// Import required modules
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

// Create Express app
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the views directory explicitly
app.set('views', path.join(__dirname, 'views'));

// Configure MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'todolist_app'
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  } else {
    console.log('Connected to MySQL database');
    connection.query('USE todolist_app');
  }
});

// Configure middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Routes


// Root path, redirect to login page
app.get('/', (req, res) => {
  res.redirect('/login');
});


// Add this line near the top of your app.js file
app.set('view engine', 'ejs');

// To-do list page - GET route
// app.get('/todolist', (req, res) => {
//   if (req.session.loggedin) {
//     const username = req.session.username;
//     // Fetch the user's to-do list from the database
//     connection.query('SELECT * FROM todos WHERE username = ?', [username], (error, results) => {
//       if (error) {
//         console.error('Error fetching to-do list:', error);
//         res.sendStatus(500);
//       } else {
//         const todos = results.map(todo => ({
//           ...todo,
//           completed: !!todo.completed // Convert the 'completed' value to a boolean
//         }));
//         // Render the 'todolist.ejs' template and pass the 'todos' data as a parameter
//         res.render('todolist', { todos });
//       }
//     });
//   } else {
//     res.redirect('/login');
//   }
// });

// To-do list page - GET route
app.get('/todolist', (req, res) => {
  if (req.session.loggedin) {
    const username = req.session.username;
    // Fetch the user's to-do list from the database
    connection.query('SELECT * FROM todos WHERE username = ?', [username], (error, results) => {
      if (error) {
        console.error('Error fetching to-do list:', error);
        res.sendStatus(500);
      } else {
        const todos = results.map(todo => ({
          ...todo
        }));
        console.log(todos);
        // Render the 'todolist.ejs' template and pass the 'todos' data and 'session' object as parameters
        console.log('Function update action:get fired!');
        res.render('todolist', { todos, session: req.session });
      }
    });
  } else {
    res.redirect('/login');
  }
});
// Update task completion status - POST route
app.post('/updateTaskCompletion', (req, res) => {
  
  if (req.session.loggedin) {
    const { taskId, completed } = req.body;
    console.log(taskId + ' ' + completed);
    if (taskId && completed !== undefined) {
      
      const updatedCompleted = completed === '1' ? 1 : 0; // Convert the 'completed' value to a boolean (0 or 1)
      console.log(updatedCompleted);
      // Update the 'completed' column in the database
      connection.query('UPDATE todos SET completed = ? WHERE id = ?', [updatedCompleted, taskId], (error) => {
        if (error) {
          console.error('Error updating task completion status:', error);
          res.sendStatus(500);
        } else {
          console.log('Function update action:post fired!');
          res.redirect('/todolist');
        }
      });
    } else {
      res.sendStatus(400); // Bad request if missing taskId or completed
    }
  } else {
    res.redirect('/login');
  }
});


// Login authentication
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    connection.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
      if (error) {
        console.error('Error retrieving user:', error);
        res.sendStatus(500);
      } else {
        if (results.length > 0) {
          const user = results[0];
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              console.error('Error comparing passwords:', err);
              res.sendStatus(500);
            } else {
              if (isMatch) {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/todolist'); // Redirect to the to-do list page after successful login
              } else {
                res.sendFile(path.join(__dirname, 'views', 'login.html'), { error: 'Incorrect password' });
              }
            }
          });
        } else {
          res.sendFile(path.join(__dirname, 'views', 'login.ejs'), { error: 'User not found' });
        }
      }
    });
  } else {
    res.sendFile(path.join(__dirname, 'views', 'login.ejs'), { error: 'Please enter username and password' });
  }
});



// User registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        res.sendStatus(500);
      } else {
        connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (error) => {
          if (error) {
            console.error('Error inserting user:', error);
            res.sendStatus(500);
          } else {
            res.redirect('/login');
          }
        });
      }
    });
  } else {
    res.sendFile(path.join(__dirname, 'views', 'register.html'), { error: 'Please enter username and password' });
  }
});

// Login page
app.get('/login', (req, res) => {
  res.render('login', { error: null , session});
});

// Registration page
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Add new task to the to-do list
app.post('/addTask', (req, res) => {
  if (req.session.loggedin) {
    const { task } = req.body;
    const username = req.session.username; // Get the username from the session

    if (username && task) {
      connection.query('INSERT INTO todos (username, task, completed) VALUES (?, ?, ?)', [username, task, false], (error) => {
        if (error) {
          console.error('Error adding new task:', error);
          res.sendStatus(500);
        } else {
          res.redirect('/todolist');
        }
      });
    } else {
      res.sendStatus(400); // Bad request if missing username or task
    }
  } else {
    res.redirect('/login');
  }
});

// Delete a task from the to-do list
app.post('/deleteTask', (req, res) => {
  if (req.session.loggedin) {
    const { taskId } = req.body;

    if (taskId) {
      connection.query('DELETE FROM todos WHERE id = ?', [taskId], (error) => {
        if (error) {
          console.error('Error deleting task:', error);
          res.sendStatus(500);
        } else {
          res.redirect('/todolist');
        }
      });
    } else {
      res.sendStatus(400); // Bad request if missing taskId
    }
  } else {
    res.redirect('/login');
  }
});
// ...

// Update task completion status - POST route
app.post('/updateTaskCompletion', (req, res) => {
  if (req.session.loggedin) {
    const { taskId, completed } = req.body;

    if (taskId && completed !== undefined) {
      const updatedCompleted = completed === '1' ? 1 : 0; // Convert the 'completed' value to a boolean (0 or 1)

      connection.query('UPDATE todos SET completed = ? WHERE id = ?', [updatedCompleted, taskId], (error) => {
        if (error) {
          console.error('Error updating task completion status:', error);
          res.sendStatus(500);
        } else {
          res.redirect('/todolist');
        }
      });
    } else {
      res.sendStatus(400); // Bad request if missing taskId or completed
    }
  } else {
    res.redirect('/login');
  }
});

// ...


// Start the server
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});