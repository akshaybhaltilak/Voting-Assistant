import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { parseCSV } from "../services/csvParser";
import { auth } from "../firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import * as XLSX from "xlsx";

const AdminPage = ({ db }) => {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [voters, setVoters] = useState([]);
  const [editingVoter, setEditingVoter] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVoters, setSelectedVoters] = useState([]);

  // Filter voters
  const filteredVoters = voters.filter(
    (v) =>
      v.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.VoterId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Select / deselect voters
  const handleSelectVoter = (id) => {
    setSelectedVoters((prev) =>
      prev.includes(id) ? prev.filter((vid) => vid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedVoters.length === filteredVoters.length) {
      setSelectedVoters([]);
    } else {
      setSelectedVoters(filteredVoters.map((v) => v.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVoters.length === 0) return;
    if (!window.confirm("Are you sure you want to delete the selected voters?"))
      return;
    try {
      for (let id of selectedVoters) {
        const voterRef = doc(db, "voters", id);
        await deleteDoc(voterRef);
      }
      setMessage(`✅ Deleted ${selectedVoters.length} voters successfully!`);
      setSelectedVoters([]);
      loadVoters();
    } catch (error) {
      console.error("Error bulk deleting voters:", error);
      setMessage("❌ Error deleting selected voters");
    }
  };

  // Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        loadVoters();
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadVoters = async () => {
    try {
      const votersRef = collection(db, "voters");
      const snapshot = await getDocs(votersRef);
      const votersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVoters(votersData);
    } catch (error) {
      console.error("Error loading voters:", error);
      setMessage("❌ Error loading voter data");
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setMessage("✅ Logged in successfully!");
      loadVoters();
    } catch (error) {
      console.error("Login error:", error);
      setMessage(`❌ Login failed: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setMessage("👋 Logged out");
    setVoters([]);
  };

  // Upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("⚠️ Please select a CSV or Excel file first.");
      return;
    }
    setUploading(true);
    setMessage("Uploading...");

    try {
      let data = [];
      if (file.name.endsWith(".csv")) {
        data = await parseCSV(file);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      }

      if (!data || data.length === 0) {
        setMessage("❌ File is empty or invalid.");
        setUploading(false);
        return;
      }

      const firstRow = data[0];
      if (!firstRow.VoterId || !firstRow.Name) {
        setMessage("❌ File must contain 'VoterId' and 'Name' columns.");
        setUploading(false);
        return;
      }

      const votersRef = collection(db, "voters");
      let successCount = 0;
      let errorCount = 0;

      for (let row of data) {
        try {
          await addDoc(votersRef, {
            Serial: row.Serial || "",
            Name: row.Name,
            Sex: row.Sex || "",
            VoterId: row.VoterId.toString(),
            Mobile: row.Mobile ? String(row.Mobile).replace(/[^0-9]/g, "") : "",
          });
          successCount++;
        } catch (err) {
          errorCount++;
        }
      }

      setMessage(
        `✅ Upload completed! ${successCount} records added, ${errorCount} failed.`
      );
      loadVoters();
    } catch (err) {
      console.error("Error parsing or uploading file:", err);
      setMessage("❌ Error processing file.");
    } finally {
      setUploading(false);
    }
  };

  // Edit & Save
  const handleEdit = (voter) => {
    setEditingVoter(voter.id);
    setEditedData(voter);
  };

  const handleSave = async (id) => {
    try {
      const voterRef = doc(db, "voters", id);
      await updateDoc(voterRef, editedData);
      setEditingVoter(null);
      setMessage("✅ Voter updated successfully!");
      loadVoters();
    } catch (error) {
      setMessage("❌ Error updating voter");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this voter?")) return;
    try {
      const voterRef = doc(db, "voters", id);
      await deleteDoc(voterRef);
      setMessage("✅ Voter deleted successfully!");
      loadVoters();
    } catch (error) {
      setMessage("❌ Error deleting voter");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">⚙️ Admin Panel</h2>
      {message && (
        <p className="mb-4 p-2 rounded bg-orange-100 text-orange-700">
          {message}
        </p>
      )}

      {!user ? (
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-orange-600 text-white rounded shadow hover:bg-orange-700"
        >
          Login with Google
        </button>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="font-medium">Welcome, {user.displayName}</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          {/* File Upload */}
          <div className="flex items-center gap-3 mb-6">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="border p-2 rounded w-full"
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="🔍 Search by Name or VoterId"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <button
              onClick={handleSelectAll}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {selectedVoters.length === filteredVoters.length
                ? "Unselect All"
                : "Select All"}
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Selected
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-orange-500 text-white">
                <tr>
                  <th className="p-2">Select</th>
                  <th className="p-2">Serial</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Sex</th>
                  <th className="p-2">VoterId</th>
                  <th className="p-2">Mobile</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVoters.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b hover:bg-orange-50 transition"
                  >
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedVoters.includes(v.id)}
                        onChange={() => handleSelectVoter(v.id)}
                      />
                    </td>
                    <td className="p-2">{v.Serial}</td>
                    <td className="p-2">
                      {editingVoter === v.id ? (
                        <input
                          className="border p-1 rounded w-full"
                          value={editedData.Name}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              Name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        v.Name
                      )}
                    </td>
                    <td className="p-2">
                      {editingVoter === v.id ? (
                        <input
                          className="border p-1 rounded w-full"
                          value={editedData.Sex}
                          onChange={(e) =>
                            setEditedData({ ...editedData, Sex: e.target.value })
                          }
                        />
                      ) : (
                        v.Sex
                      )}
                    </td>
                    <td className="p-2">{v.VoterId}</td>
                    <td className="p-2">
                      {editingVoter === v.id ? (
                        <input
                          className="border p-1 rounded w-full"
                          value={editedData.Mobile}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              Mobile: e.target.value,
                            })
                          }
                        />
                      ) : (
                        v.Mobile
                      )}
                    </td>
                    <td className="p-2 flex gap-2">
                      {editingVoter === v.id ? (
                        <button
                          onClick={() => handleSave(v.id)}
                          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(v)}
                          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredVoters.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-4 text-center text-gray-500 italic"
                    >
                      No voters found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPage;
