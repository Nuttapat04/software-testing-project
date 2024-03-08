const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;


let account=[
  {user:1, id: 'user1', password: 'pass1',confirmpass:'pass1'},{user:2, id: 'user2', password: 'pass2',confirmpass:'pass2'},
  {user:3, id: 'user3', password: 'pass3',confirmpass:'pass3'},{user:4, id: 'user4', password: 'pass4',confirmpass:'pass4'},
  {user:5, id: 'admin', password: 'admin',confirmpass:'admin'},
]
app.use(bodyParser.json());

app.post('/register', (req, res) => {
  const { id, password, confirmpass } = req.query;

  if (!id || !password) {
    return res.status(400).json({ message: 'id and password are required' });
  }
  
  const existingUser = account.find(user => user.id === id);
  if (existingUser) {
    return res.status(400).json({ message: 'id already exists' }); 
  }
  
  if (id.length < 6) {
    return res.status(400).json({ message: 'id should be at least 6 characters long' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password should be at least 6 characters long' });
  }
  
  
  const uppercaseRegex = /[A-Z]/;
  if (!uppercaseRegex.test(password)) {
    return res.status(400).json({ message: 'Password should contain at least one uppercase letter' });
  }

  if(confirmpass != password){
    return res.status(400).json({ message: 'Confirmpassword should be the same as Password' });
  }
  
  const newUser = { user: account.length + 1, id, password };
  account.push(newUser);
  res.status(201).json({ message: 'register successfully !!!!!!' });
});


app.post('/login', (req, res) => {
  const { id, password } = req.query;

  if (!id) {
    return res.status(401).json({ message: 'Invalid id' });
  }

  const user = account.find(user => user.id === id);
  if (!user) {
    return res.status(401).json({ message: 'Invalid id' });
  }

  if (!password || user.password !== password) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  res.status(200).json({ message: 'Login successful' });
});
  

app.get('/account', (req, res) => {
  res.status(200).json(account);  
});
  
app.get('/account/:user', (req, res) => {
  const useruser = parseInt(req.params.user);
  const user = account.find(user => user.user === useruser);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json(user);
});


app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
