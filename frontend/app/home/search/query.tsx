import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";


// Function to perform a query
export const queryUserByName = async (search: string): Promise<any> => {
    // https://firebase.google.com/docs/firestore/query-data/queries?authuser=0
    const coll = collection(db, "users");
    const q = query(coll, where("name", "==", search));

    const targetAccounts = await getDocs(q);

    const returnData: any[] = [];
    targetAccounts.forEach((doc) => {
        // console.log(doc.id, " => ", doc.data());
        returnData.push({[doc.id]: doc.data()});
    });
    // console.log(returnData);
    return returnData;
};