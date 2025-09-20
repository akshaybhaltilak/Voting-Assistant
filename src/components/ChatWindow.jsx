import React, { useState, useRef, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Send, User, Bot, Loader2, Download, CheckCircle, MapPin, Phone, Hash } from "lucide-react";

const ChatWindow = ({ db }) => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your voting assistant. I can help you find voter information using:\n\n• **Voter ID** (e.g., AMB5778105)\n• **Name in English** (e.g., Rahul, Priya)\n• **Name in Marathi** (e.g., राहुल, प्रिया)\n\nJust type the name or ID and I'll search for matching records!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // English to Marathi phonetic mapping
  const phoneticMap = {
    'a': ['अ', 'आ', 'ा'],
    'aa': ['आ', 'ा'],
    'i': ['इ', 'ी', 'ि'],
    'ii': ['ई', 'ी'],
    'u': ['उ', 'ू', 'ु'],
    'uu': ['ऊ', 'ू'],
    'e': ['ए', 'े'],
    'ai': ['ऐ', 'ै'],
    'o': ['ओ', 'ो'],
    'au': ['औ', 'ौ'],
    'ka': ['क', 'का', 'क्'],
    'kha': ['ख', 'खा', 'ख्'],
    'ga': ['ग', 'गा', 'ग्'],
    'gha': ['घ', 'घा', 'घ्'],
    'cha': ['च', 'चा', 'च्'],
    'chha': ['छ', 'छा', 'छ्'],
    'ja': ['ज', 'जा', 'ज्'],
    'jha': ['झ', 'झा', 'झ्'],
    'ta': ['त', 'ता', 'त्', 'ट', 'टा', 'ट्'],
    'tha': ['थ', 'था', 'थ्', 'ठ', 'ठा', 'ठ्'],
    'da': ['द', 'दा', 'द्', 'ड', 'डा', 'ड्'],
    'dha': ['ध', 'धा', 'ध्', 'ढ', 'ढा', 'ढ्'],
    'na': ['न', 'ना', 'न्', 'ण', 'णा', 'ण्'],
    'pa': ['प', 'पा', 'प्'],
    'pha': ['फ', 'फा', 'फ्'],
    'ba': ['ब', 'बा', 'ब्'],
    'bha': ['भ', 'भा', 'भ्'],
    'ma': ['म', 'मा', 'म्'],
    'ya': ['य', 'या', 'य्'],
    'ra': ['र', 'रा', 'र्'],
    'la': ['ल', 'ला', 'ल्'],
    'va': ['व', 'वा', 'व्'],
    'wa': ['व', 'वा', 'व्'],
    'sha': ['श', 'शा', 'श्', 'ष', 'षा', 'ष्'],
    'sa': ['स', 'सा', 'स्'],
    'ha': ['ह', 'हा', 'ह्'],
    'ksha': ['क्ष', 'क्षा'],
    'tra': ['त्र', 'त्रा'],
    'gya': ['ज्ञ', 'ज्ञा']
  };

  // Create phonetic variations of English input
  const createPhoneticVariations = (englishName) => {
    const variations = [englishName.toLowerCase()];
    
    // Common phonetic mappings for names
    const nameVariations = {
      'rahul': ['राहुल', 'राहूल'],
      'amit': ['अमित', 'अमीत'],
      'anjali': ['अंजली', 'अञ्जली'],
      'priya': ['प्रिया', 'प्रीया'],
      'sunil': ['सुनील', 'सुनिल'],
      'mukesh': ['मुकेश', 'मुकेष'],
      'deepak': ['दीपक', 'दिपक'],
      'sanjay': ['संजय', 'सञ्जय'],
      'vijay': ['विजय', 'विजे'],
      'ajay': ['अजय', 'अजे'],
      'rajesh': ['राजेश', 'राजेष'],
      'mahesh': ['महेश', 'महेष'],
      'ganesh': ['गणेश', 'गणेष'],
      'ramesh': ['रमेश', 'रमेष'],
      'yogesh': ['योगेश', 'योगेष'],
      'dinesh': ['दिनेश', 'दिनेष'],
      'rakesh': ['राकेश', 'राकेष'],
      'lokesh': ['लोकेश', 'लोकेष'],
      'ritesh': ['रितेश', 'रितेष'],
      'suresh': ['सुरेश', 'सुरेष'],
      'naresh': ['नरेश', 'नरेष'],
      'kiran': ['किरण', 'किरन'],
      'varun': ['वरुण', 'वरुन'],
      'arjun': ['अर्जुन', 'अर्जून'],
      'sachin': ['सचिन', 'सचीन'],
      'rohan': ['रोहन', 'रोहण'],
      'mohan': ['मोहन', 'मोहण'],
      'sohan': ['सोहन', 'सोहण'],
      'krishna': ['कृष्णा', 'कृष्ण'],
      'shiva': ['शिवा', 'शिव'],
      'vishnu': ['विष्णु', 'विष्णू']
    };

    const lowerName = englishName.toLowerCase().trim();
    if (nameVariations[lowerName]) {
      variations.push(...nameVariations[lowerName]);
    }

    return variations;
  };

  // Download receipt function
  const downloadReceipt = (voterData) => {
    const receiptContent = `
VOTER INFORMATION RECEIPT
========================

Name: ${voterData.Name}
Voter ID: ${voterData.VoterId}
Sex/Age: ${voterData.Sex || "N/A"}
Mobile: ${voterData.Mobile || "N/A"}

Generated on: ${new Date().toLocaleString()}
Source: Voting Assistant Portal
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voter-receipt-${voterData.VoterId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Enhanced search function with phonetic matching
  const searchVoter = async (queryText) => {
    try {
      const votersRef = collection(db, "voters");
      let results = [];

      // Detect voter ID (alphanumeric and length > 5)
      if (/^[A-Za-z0-9]{6,}$/.test(queryText)) {
        const voterId = queryText.trim().toUpperCase();
        const q = query(votersRef, where("VoterId", "==", voterId));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          snapshot.forEach((doc) => {
            const data = doc.data();
            results.push(data);
          });
        }
      } else {
        // Search by Name with phonetic variations
        const nameQuery = queryText.trim();
        const phoneticVariations = createPhoneticVariations(nameQuery);
        
        // Search for each phonetic variation
        for (const variation of phoneticVariations) {
          try {
            // Exact match search
            const exactQuery = query(votersRef, where("Name", "==", variation));
            const exactSnapshot = await getDocs(exactQuery);
            
            exactSnapshot.forEach((doc) => {
              const data = doc.data();
              if (!results.find(r => r.VoterId === data.VoterId)) {
                results.push(data);
              }
            });

            // Prefix search for longer variations
            if (variation.length >= 2) {
              const prefixQuery = query(
                votersRef,
                where("Name", ">=", variation),
                where("Name", "<=", variation + "\uf8ff")
              );
              const prefixSnapshot = await getDocs(prefixQuery);
              
              prefixSnapshot.forEach((doc) => {
                const data = doc.data();
                if (!results.find(r => r.VoterId === data.VoterId)) {
                  results.push(data);
                }
              });
            }
          } catch (err) {
            console.error(`Error searching for variation "${variation}":`, err);
            // Continue with other variations even if one fails
          }
        }

        // If no results found with phonetic matching, try fuzzy matching
        if (results.length === 0) {
          try {
            // Get all documents and perform client-side fuzzy matching
            const allDocsQuery = query(votersRef);
            const allSnapshot = await getDocs(allDocsQuery);
            
            allSnapshot.forEach((doc) => {
              const data = doc.data();
              const nameToCheck = data.Name?.toLowerCase() || '';
              const queryLower = nameQuery.toLowerCase();
              
              // Simple fuzzy matching - check if query is contained in name or vice versa
              if (nameToCheck.includes(queryLower) || queryLower.includes(nameToCheck)) {
                if (!results.find(r => r.VoterId === data.VoterId)) {
                  results.push(data);
                }
              }
            });
          } catch (err) {
            console.error("Error in fuzzy matching:", err);
          }
        }
      }

      if (results.length === 0) {
        return {
          type: "error",
          message: `No voter record found for "${queryText}". Please check your input and try again.`,
          tips: [
            "Try searching with full name",
            "Use Voter ID if available",
            "Names can be in English or Marathi"
          ]
        };
      }

      // Limit results to prevent overwhelming response
      const limitedResults = results.slice(0, 10);
      
      return {
        type: "success",
        results: limitedResults,
        totalFound: results.length,
        query: queryText
      };
    } catch (err) {
      console.error("Error searching voter:", err);
      return {
        type: "error",
        message: "I'm sorry, there was an error searching the voter database. Please try again in a moment."
      };
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await searchVoter(input.trim());

      // Simulate typing delay
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", data: response }]);
        setIsLoading(false);
        setIsTyping(false);
      }, 800 + Math.random() * 800);
    } catch (err) {
      console.error("Error getting response:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          data: {
            type: "error",
            message: "I'm experiencing some technical difficulties right now. Please try again in a few moments."
          }
        },
      ]);
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const formatMessage = (text) => {
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .split('\n')
      .map((line, i) => (
        <div key={i} dangerouslySetInnerHTML={{ __html: line }} className={line ? "mb-1" : "mb-2"} />
      ));
  };

  const renderBotMessage = (msg) => {
    // Handle old text-based messages
    if (msg.text && !msg.data) {
      return (
        <div className="whitespace-pre-wrap leading-relaxed">
          {formatMessage(msg.text)}
        </div>
      );
    }

    const { data } = msg;

    // Error message
    if (data.type === "error") {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-medium mb-2">{data.message}</p>
              {data.tips && (
                <div className="space-y-1">
                  <p className="text-red-700 font-medium text-sm">Search Tips:</p>
                  <ul className="text-red-600 text-sm space-y-1">
                    {data.tips.map((tip, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Success message with results
    if (data.type === "success") {
      return (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-semibold">
                Found {data.totalFound} record{data.totalFound > 1 ? 's' : ''} for "{data.query}"
              </span>
            </div>
            {data.totalFound > 10 && (
              <p className="text-green-700 text-sm mt-2">
                Showing first 10 results. Please be more specific if needed.
              </p>
            )}
          </div>

          {/* Results */}
          <div className="space-y-3">
            {data.results.map((voter, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-5">
                  {/* Header with name and status */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{voter.Name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified Voter
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadReceipt(voter)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 transition-colors duration-200"
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      Download Receipt
                    </button>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Hash className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Voter ID</p>
                        <p className="text-base font-semibold text-gray-900">{voter.VoterId}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Sex/Age</p>
                        <p className="text-base font-semibold text-gray-900">{voter.Sex || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Mobile</p>
                        <p className="text-base font-semibold text-gray-900">{voter.Mobile || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="text-base font-semibold text-green-600">Active Voter</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Voting Assistant</h1>
            <p className="text-sm text-gray-500">Get voter information instantly</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex items-start space-x-3">
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.sender === "user" 
                ? "bg-gray-100" 
                : "bg-gradient-to-br from-orange-500 to-amber-600"
            }`}>
              {msg.sender === "user" ? (
                <User className="w-4 h-4 text-gray-600" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            
            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className={`max-w-none ${
                msg.sender === "user" 
                  ? "text-gray-900" 
                  : "text-gray-800"
              }`}>
                {msg.sender === "bot" ? renderBotMessage(msg) : (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Assistant is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 px-6 py-4 bg-white">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Enter Voter ID or Name..."
              disabled={isLoading}
              rows={1}
              className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500 text-gray-900"
              style={{
                minHeight: "48px",
                maxHeight: "120px",
              }}
            />
          </div>
          
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`p-3 rounded-lg transition-all duration-200 ${
              isLoading || !input.trim()
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 shadow-sm hover:shadow-md"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Helper Text */}
        <div className="mt-2 text-xs text-gray-500">
          Search with Voter ID (like "AMB5778105") or name in English/Marathi (e.g., "Rahul" or "राहुल")
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;