import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useTheme } from '../context/ThemeContext';

const TutorialGuide = () => {
  const [run, setRun] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('vibeflix_tutorial_seen');
    if (!hasSeenTutorial) {
      // Small delay to ensure components are mounted
      setTimeout(() => setRun(true), 1000);
    }
  }, []);

  const steps = [
    {
      target: '.nav-logo',
      content: 'Welcome to VibeFlix! 🍿 Your ultimate movie streaming destination.',
      disableBeacon: true,
    },
    {
      target: 'a[href="/discover"].nav-link',
      content: 'Looking for something specific? Click here to find your perfect type with our AI recommender.',
      placement: 'bottom',
    },
    {
      target: '.nav-search-btn',
      content: 'Quickly search for any movie or web series here. Just press Enter!',
      placement: 'bottom',
    },
    {
      target: '.theme-toggle-btn',
      content: 'Switch between Midnight Black and Light mode seamlessly.',
      placement: 'bottom',
    },
    {
      target: '.category-bar-wrapper',
      content: 'Filter movies and series easily with our dynamic categories, genres, and languages!',
      placement: 'top',
    },
    {
      target: '.nav-user-menu',
      content: 'Manage your profile or log out here. Enjoy watching!',
      placement: 'bottom',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('vibeflix_tutorial_seen', 'true');
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#4cc9f0', // cyan theme color
          backgroundColor: theme === 'dark' ? '#0a0d1a' : '#ffffff',
          textColor: theme === 'dark' ? '#ffffff' : '#333333',
          arrowColor: theme === 'dark' ? '#0a0d1a' : '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.7)'
        },
        buttonNext: {
          backgroundColor: '#4cc9f0',
          color: '#0a0d1a',
          fontWeight: 'bold',
          borderRadius: '50px'
        },
        buttonBack: {
          color: theme === 'dark' ? '#a0aec0' : '#666',
        },
        buttonSkip: {
          color: '#f87171',
        },
        tooltipContainer: {
          textAlign: 'left'
        },
        tooltipTitle: {
          margin: 0
        }
      }}
    />
  );
};

export default TutorialGuide;
