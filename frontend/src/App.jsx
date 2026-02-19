import './App.css'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MainScreen from "./MainScreen/MainScreen.jsx";
import Login from "./Login/Login.jsx";
import Registration from "./Registration/Registration.jsx";
import { useState } from 'react';

export const YourUser = {id: 1, name: "YourUsername", status: "Hi", online: true, icon: "public/vite.svg"}

const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
const theme = createTheme({
  palette: {
    mode: darkThemeMq.matches ? 'dark' : 'light',
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleNavigateToRegister = () => {
    setCurrentPage('register');
  };

  const handleNavigateToLogin = () => {
    setCurrentPage('login');
  };

  const renderPage = () => {
    if (isLoggedIn) {
      return <MainScreen />;
    }

    if (currentPage === 'register') {
      return <Registration onRegistrationSuccess={handleNavigateToLogin} />;
    }

    return <Login 
      onLogin={handleLogin} 
      onRegisterClick={handleNavigateToRegister} 
    />;
  };

  return (
    <div>
      <ThemeProvider theme={theme}>
        {renderPage()}
      </ThemeProvider>
    </div>
  )
}

export default App