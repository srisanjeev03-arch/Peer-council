import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import MoodTracker from './components/MoodTracker';
import CrisisResources from './components/CrisisResources';
import './App.css';

export default function App() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('chat');
  const [currentConversation, setCurrentConversation] = useState(null);

  const handleNewMessage = (message) => {
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading MindfulSpace...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentConversation={currentConversation}
        setCurrentConversation={setCurrentConversation}
      />
      <main className="main-content">
        {currentView === 'chat' && currentConversation && (
          <Chat
            conversationId={currentConversation}
            onNewMessage={handleNewMessage}
          />
        )}
        {currentView === 'chat' && !currentConversation && (
          <div className="empty-state">
            <h2>Welcome to MindfulSpace</h2>
            <p>Start a new conversation to begin your wellness journey</p>
          </div>
        )}
        {currentView === 'mood' && <MoodTracker />}
        {currentView === 'resources' && <CrisisResources />}
      </main>
    </div>
  );
}
