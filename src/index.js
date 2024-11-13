import React, { useState, useEffect, useContext } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WeatherProvider from './contexts/weatherContext';
import  SiteDataProvider  from './contexts/siteDataContext';
import { AlertProvider } from './contexts/alertContext';
import WeatherPage from './pages/weatherPage';
import { createUserWithEmailAndPassword, onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { addUser } from './api/userDataStorage';
import { auth } from './firebase-config';
import MovieTrackingPage from './pages/movieTrackingPage';
import MovieHomePage from './pages/movieHomePage';
import SiteFooter from './components/siteFooter';
import MovieDetailsPage from './pages/movieDetailsPage';
import HomePage from './pages/homePage';
import Header from './components/siteHeader';
import AlertNotice from './components/alertNotice';
import LoginPage from './pages/loginPage';
import './index.css';
import PersonPage from './pages/personPage';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@emotion/react';
import { darkTheme,lightTheme } from './themes';


const PrivateRoute = ({ children, isAuthenticated, loadedUser }) => {
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {

    // Check if isAuthenticated is false and loadedUser is true
    if (!isAuthenticated && loadedUser) {
      setShouldRedirect(true);
    }
  }, [isAuthenticated, loadedUser]); // Include both dependencies in the array

  return isAuthenticated ? (
    children
  ) : (shouldRedirect ?(
    <Navigate to="/login" replace />
  )
  : <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}><CircularProgress/></div>
);
};



const App = () => {
  const [user, setUser] = useState(null);
  const [loadedUser, setLoadedUser] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoadedUser(true);
    }
    );

    return () => {
      unsubscribe();
    }
  }, []);

  const handleLogin = async (username, password) => {
    try {
      await signInWithEmailAndPassword(auth, username, password);
    } catch (error) {
      console.log(error);
      throw new Error('Error signing in: ' + error.code);
    }
  };

  const handleRegister = async (username, password, firstName, lastName, dateOfBirth) => {
    try {
      const user = await createUserWithEmailAndPassword(auth, username, password);
      const userObject = {
        email: username,
        dateOfBirth: dateOfBirth,
        firstName: firstName,
        lastName: lastName,
        id: user.user.uid
      };
      await addUser(userObject);
    } catch (error) {
      console.log(error);
      throw new Error('Error signing up: ' + error.code);
    }
  };

  const updateThemeProvider = (isDarkMode) => {
    setDarkMode(isDarkMode);
  };
 

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      
      throw new Error('Error signing out: '+ error.code);
    }
  };

  return (
      <Router>
        <WeatherProvider>
        <AlertProvider>
        <SiteDataProvider>
        <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>

        <Header authenticated={user !== null}  />
        <Routes>
          <Route
            path="/login"
            element={<LoginPage handleLogin={handleLogin} handleRegister={handleRegister} handleLogout={handleLogout} isAuthenticated={user !==null} updateThemeProvider={updateThemeProvider} />}
          />
          <Route
            path="/weather"
            element={<PrivateRoute isAuthenticated={user !== null} loadedUser={loadedUser}><WeatherPage /></PrivateRoute>}
          />
          <Route
            path="/home"
            element={<PrivateRoute isAuthenticated={user !== null} loadedUser={loadedUser}><HomePage /></PrivateRoute>}
          />
          <Route
            path="/movielist/:listId"
            element={<PrivateRoute isAuthenticated={user !== null} loadedUser={loadedUser}><MovieTrackingPage /></PrivateRoute>}
          />
          <Route
            path="/movie/:id"
            element={<PrivateRoute isAuthenticated={user !== null} loadedUser={loadedUser}><MovieDetailsPage /></PrivateRoute>}
          />
          <Route
            path="/movielist"
            element={<PrivateRoute isAuthenticated={user !== null} loadedUser={loadedUser}><MovieHomePage /></PrivateRoute>}
          />
          <Route
            path="/person/:id"
            element={<PrivateRoute isAuthenticated={user !== null}><PersonPage /></PrivateRoute>}
          />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
        <SiteFooter/>
        <AlertNotice/>
        </ThemeProvider>
        </SiteDataProvider>
        </AlertProvider>
        </WeatherProvider>
      </Router>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
