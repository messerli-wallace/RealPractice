import firebase, { initializeApp } from 'firebase/app';
import { getDatabase, ref, DataSnapshot, query, orderByChild, equalTo, get } from 'firebase/database';
import { config2 } from "../../firebase.tsx";


const app = initializeApp(config2);
const database = getDatabase(app);

// Function to perform a query
export const performFirebaseQuery = async (search: string): Promise<any> => {
    const dataRef = ref(database, `userbase/users/${search}`);
    const q = query(dataRef, orderByChild('post1'));
    try {
        const snapshot: DataSnapshot = await get(q);
        const data = snapshot.val();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return 'Error fetching data:';
    }
};