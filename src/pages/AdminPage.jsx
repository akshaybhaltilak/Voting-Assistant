import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { parseCSV } from '../services/csvParser';

const AdminPage = ({ db }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a CSV file first.");
      return;
    }

    setUploading(true);
    setMessage("Uploading...");

    try {
      const data = await parseCSV(file);
      if (!data || data.length === 0) {
        setMessage("❌ CSV file is empty or invalid.");
        setUploading(false);
        return;
      }

      const firstRow = data[0];
      if (!firstRow.voter_id || !firstRow.name) {
        setMessage("❌ CSV must contain 'voter_id' and 'name' columns.");
        setUploading(false);
        return;
      }

      const votersRef = collection(db, "voters");
      let successCount = 0;
      let errorCount = 0;

      for (let row of data) {
        try {
          await addDoc(votersRef, {
            voter_id: row.voter_id.toString(),
            name: row.name,
            location: row.location || "",
            room_no: row.room_no || ""
          });
          successCount++;
        } catch (err) {
          console.error("Error adding document:", err);
          errorCount++;
          
          // If it's a permissions error, provide specific guidance
          if (err.code === 'permission-denied') {
            setMessage("❌ Permission denied. Please check Firestore security rules.");
            setUploading(false);
            return;
          }
        }
      }

      setMessage(`✅ Upload completed! ${successCount} records added, ${errorCount} failed.`);
    } catch (err) {
      console.error("Error parsing or uploading CSV:", err);
      setMessage("❌ Error processing CSV file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Panel – Upload Voter List</h2>
        <p className="text-gray-600 mb-6">Upload a CSV file with voter information to populate the database.</p>
        
        {/* Security rules reminder */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            <strong>Important:</strong> Make sure your Firestore security rules allow write access to the 'voters' collection.
            Go to Firebase Console → Firestore Database → Rules and use:
            <pre className="bg-gray-100 p-2 mt-2 rounded text-xs">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /voters/{document} {
      allow read, write: if true;
    }
  }
}`}
            </pre>
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">CSV File</label>
          <div className="flex items-center">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />
              <div className="flex flex-col items-center px-6 py-4 bg-white text-blue-600 rounded-lg border-2 border-dashed border-blue-400 hover:bg-blue-50">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <span className="font-medium">Choose a CSV file</span>
                <span className="text-sm text-gray-500">or drag and drop here</span>
              </div>
            </label>
          </div>
          {fileName && (
            <p className="mt-2 text-sm text-gray-600">
              Selected file: <span className="font-medium">{fileName}</span>
            </p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">CSV Format Requirements</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Your CSV file should include the following columns:</p>
            <ul className="text-sm text-gray-600 list-disc pl-5">
              <li><span className="font-mono">voter_id</span> (required) - Unique identifier for each voter</li>
              <li><span className="font-mono">name</span> (required) - Full name of the voter</li>
              <li><span className="font-mono">location</span> (optional) - Voting location</li>
              <li><span className="font-mono">room_no</span> (optional) - Room number for voting</li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            'Upload Voter Data'
          )}
        </button>

        {message && (
          <div className={`mt-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p className="font-medium">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;