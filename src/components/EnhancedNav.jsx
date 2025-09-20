import React, { useState } from 'react';

const EnhancedNav = ({ currentView, setCurrentView }) => {
  const [showElectionInfo, setShowElectionInfo] = useState(false);
  const [isMarathi, setIsMarathi] = useState(true);

  const toggleLanguage = () => {
    setIsMarathi(!isMarathi);
  };

  const electionInfo = isMarathi 
    ? {
        title: "निवडणूक माहिती",
        items: [
          "मतदार नोंदणी प्रक्रिया",
          "मतदानाचे तंत्रज्ञान",
          "मतदान केंद्रे ठिकाणे",
          "मतदार हक्क आणि कर्तव्ये",
          "विशेष मतदार सोयी"
        ]
      }
    : {
        title: "Election Information",
        items: [
          "Voter Registration Process",
          "Voting Technology",
          "Polling Center Locations",
          "Voter Rights and Duties",
          "Special Voter Facilities"
        ]
      };

  return (
    <nav className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 text-white p-4 shadow-2xl relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500"></div>
      
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="bg-white p-2 rounded-full mr-3 shadow-lg animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400">
            {isMarathi ? "मतदार माहिती प्रणाली" : "Voter Information System"}
          </h1>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          <div className="relative group">
            <button 
              onMouseEnter={() => setShowElectionInfo(true)}
              onMouseLeave={() => setShowElectionInfo(false)}
              className="flex items-center px-4 py-2 rounded-full bg-indigo-800 text-white hover:bg-indigo-900 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {electionInfo.title}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showElectionInfo && (
              <div 
                className="absolute z-50 left-0 mt-2 w-64 bg-white text-gray-800 rounded-xl shadow-2xl overflow-hidden"
                onMouseEnter={() => setShowElectionInfo(true)}
                onMouseLeave={() => setShowElectionInfo(false)}
              >
                <div className="px-4 py-2 bg-indigo-700 text-white font-bold">
                  {electionInfo.title}
                </div>
                <ul className="py-2">
                  {electionInfo.items.map((item, index) => (
                    <li key={index} className="px-4 py-2 hover:bg-indigo-100 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-0">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setCurrentView('chat')} 
            className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${currentView === 'chat' 
              ? 'bg-white text-indigo-700 shadow-lg transform scale-105 font-semibold' 
              : 'bg-indigo-800 text-white hover:bg-indigo-900 shadow-md'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {isMarathi ? "चॅट" : "Chat"}
          </button>
          
          <button 
            onClick={() => setCurrentView('admin')} 
            className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${currentView === 'admin' 
              ? 'bg-orange-500 text-white shadow-lg transform scale-105 font-semibold' 
              : 'bg-indigo-800 text-white hover:bg-indigo-900 shadow-md'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isMarathi ? "प्रशासन" : "Admin"}
          </button>
          
          <button 
            onClick={toggleLanguage}
            className="flex items-center px-4 py-2 rounded-full bg-white text-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {isMarathi ? "English" : "मराठी"}
          </button>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full flex justify-between px-10 opacity-30">
        <svg className="h-8 w-8 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <svg className="h-8 w-8 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
    </nav>
  );
};

export default EnhancedNav;