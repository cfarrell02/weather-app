import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { SiteDataContext } from '../../../contexts/siteDataContext';
import { getUserById } from '../../../api/userDataStorage';

const Login = ({ handleLogin, addAlert }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const {adultContent, setAdultContent} = React.useContext(SiteDataContext);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username || !password) {
      addAlert('error', 'Please fill out all fields');
      return;
    }

    try {
      const result = await handleLogin(username, password);
      const userData = await getUserById(result.user.uid);
      setAdultContent(userData.adultAllowed);
      localStorage.setItem('adultContent', userData.adultAllowed);
      addAlert('success', 'Logged in');
    } catch (error) {
      addAlert('error', 'Error logging in: ' + error.message);
    }
  };

  return (
    <>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Login
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <TextField
          label="Email"
          variant="outlined"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button variant="contained" type="submit" color="primary">
          Login
        </Button>
      </Box>
    </>
  );
};

export default Login;
