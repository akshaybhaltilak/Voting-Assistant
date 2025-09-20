import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../Firebase/firebaseConfig";

export const getVoterById = async (voterId) => {
  const q = query(collection(db, "voters"), where("voterId", "==", voterId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data())[0] || null;
};

export const getVoterByName = async (name) => {
  const q = query(collection(db, "voters"), where("name", "==", name));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data())[0] || null;
};
