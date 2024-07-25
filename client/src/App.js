// This file is the main component of the application. It contains the AppBar, Drawer, and the main content of the application.

import React, { useState } from 'react';
import { CssBaseline, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Divider, ListItemButton, ListItemIcon } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import MainPage from './components/MainPage';
import TimePage from './components/TimePage';
import NetworkPage from './components/NetworkPage';
import VictimPage from './components/VictimPage';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GitHubIcon from '@mui/icons-material/GitHub';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TimelineIcon from '@mui/icons-material/Timeline';
import LanIcon from '@mui/icons-material/Lan';
import PersonIcon from '@mui/icons-material/Person';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState('main');

  const handleGithub = () => {
    window.open('https://github.com/DroitXenon/CYGA', '_blank');
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setDrawerOpen(false);
  };

  const handleBackClick = () => {
    if (page === 'main' && typeof window.handleMainPageBackClick === 'function') {
      window.handleMainPageBackClick();
    } else {
      setPage('main');
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="app">
        <AppBar position="sticky">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <IconButton color="inherit" onClick={handleBackClick} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Cyber Geolocation Analysis
            </Typography>
            <IconButton color="inherit" onClick={handleGithub}>
              <GitHubIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Drawer
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          anchor="left"
        >
          <List>
            <ListItem disablePadding onClick={() => handlePageChange('main')}>
              <ListItemButton>
                <ListItemIcon>
                  <FormatListBulletedIcon />
                </ListItemIcon>
                <ListItemText primary="Attacks" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding onClick={() => handlePageChange('time')}>
              <ListItemButton>
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText primary="Time" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding onClick={() => handlePageChange('network')}>
              <ListItemButton>
                <ListItemIcon>
                  <LanIcon />
                </ListItemIcon>
                <ListItemText primary="Network" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding onClick={() => handlePageChange('victim')}>
              <ListItemButton>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Victim" />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
        </Drawer>
        {page === 'main' && <MainPage />}
        {page === 'time' && <TimePage />}
        {page === 'network' && <NetworkPage />}
        {page === 'victim' && <VictimPage />}
      </div>
    </ThemeProvider>
  );
}

export default App;