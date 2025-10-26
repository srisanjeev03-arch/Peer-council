import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './Sidebar.css';

export default function Sidebar({ currentView, setCurrentView, currentConversation, setCurrentConversation }) {
  const [conversations, setConversations] = useState([]);
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          {
            user_id: user.id,
            title: 'New Conversation',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setConversations([data, ...conversations]);
      setCurrentConversation(data.id);
      setCurrentView('chat');
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleConversationUpdate = async (conversationId, title) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, title } : conv
        )
      );
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  const updateConversationTitle = (firstMessage) => {
    if (currentConversation) {
      const title = firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');
      handleConversationUpdate(currentConversation, title);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>MindfulSpace</h2>
        <p>Hello, {profile?.full_name || 'User'}</p>
      </div>

      <button className="btn-new-chat" onClick={handleNewConversation}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        New Chat
      </button>

      <nav className="sidebar-nav">
        <button
          className={currentView === 'chat' ? 'active' : ''}
          onClick={() => {
            if (conversations.length > 0 && !currentConversation) {
              setCurrentConversation(conversations[0].id);
            }
            setCurrentView('chat');
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Chat
        </button>
        <button
          className={currentView === 'mood' ? 'active' : ''}
          onClick={() => setCurrentView('mood')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="9" y1="9" x2="9" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="15" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Mood Tracker
        </button>
        <button
          className={currentView === 'resources' ? 'active' : ''}
          onClick={() => setCurrentView('resources')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Crisis Resources
        </button>
      </nav>

      {conversations.length > 0 && (
        <div className="conversations-list">
          <h3>Recent Conversations</h3>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className={currentConversation === conv.id ? 'active' : ''}
              onClick={() => {
                setCurrentConversation(conv.id);
                setCurrentView('chat');
              }}
            >
              {conv.title}
            </button>
          ))}
        </div>
      )}

      <button className="btn-signout" onClick={signOut}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Sign Out
      </button>
    </div>
  );
}
