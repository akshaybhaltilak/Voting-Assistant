import { collection, query, where, getDocs } from 'firebase/firestore';

export const askGemini = async (userInput, db) => {
  // Simple number extraction for voter ID
  const numbersInInput = userInput.match(/\d+/g);
  const voterId = numbersInInput && numbersInInput.length > 0 ? numbersInInput[0] : null;
  
  // Simple name extraction (look for words after "name" or "my name is")
  let name = null;
  if (userInput.toLowerCase().includes('name')) {
    const nameMatch = userInput.match(/(?:name|my name is)\s+([a-zA-Z\s]+)/i);
    if (nameMatch) name = nameMatch[1].trim();
  }
  
  console.log("User input:", userInput);
  console.log("Extracted voter ID:", voterId);
  console.log("Extracted name:", name);
  
  if (voterId || name) {
    try {
      const votersRef = collection(db, "voters");
      let q;
      
      if (voterId) {
        console.log("Searching for voter ID:", voterId);
        q = query(votersRef, where("voter_id", "==", voterId));
      } else if (name) {
        console.log("Searching for name:", name);
        q = query(votersRef, where("name", ">=", name), where("name", "<=", name + '\uf8ff'));
      }
      
      const querySnapshot = await getDocs(q);
      console.log("Query snapshot size:", querySnapshot.size);
      
      if (querySnapshot.empty) {
        console.log("No documents found");
        return "I couldn't find any voter information matching your query. Please check your details and try again.";
      }
      
      let response = "I found the following voter information:\n\n";
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Document data:", data);
        
        response += `Voter ID: ${data.voter_id || 'Not available'}\n`;
        response += `Name: ${data.name || 'Not available'}\n`;
        if (data.location) response += `Location: ${data.location}\n`;
        if (data.room_no) response += `Room Number: ${data.room_no}\n`;
        response += "\n";
      });
      
      return response;
    } catch (error) {
      console.error("Error fetching voter data:", error);
      return "Sorry, I'm having trouble accessing the voter database right now. Please try again later.";
    }
  }
  
  return "I'm your voting assistant. You can ask me about voter information by providing your Voter ID or Name. For example: 'My voter ID is 1001' or 'My name is John Doe'.";
};