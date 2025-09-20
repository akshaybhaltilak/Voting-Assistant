import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import AdminPage from './components/AdminPage';
import { db } from './firebase';
import EnhancedNav from './components/EnhancedNav'; // Import the new component

const App = () => {
  const [currentView, setCurrentView] = useState('chat');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Enhanced Navigation */}
      <EnhancedNav currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {currentView === 'chat' ? (
          <div className="flex justify-center">
            <ChatWindow db={db} />
          </div>
        ) : (
          <AdminPage db={db} />
        )}
      </main>
    </div>
  );
};

export default App;