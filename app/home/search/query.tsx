import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { UserData, SearchResultItem } from "../../../types";

// Function to perform a query
export const queryUserByName = async (
  search: string
): Promise<SearchResultItem[]> => {
  // https://firebase.google.com/docs/firestore/query-data/queries?authuser=0
  const coll = collection(db, "users");
  const q = query(coll, where("name", "==", search));

  const targetAccounts = await getDocs(q);

  const returnData: SearchResultItem[] = [];
  targetAccounts.forEach((doc) => {
    // console.log(doc.id, " => ", doc.data());
    returnData.push({ [doc.id]: doc.data() as UserData });
  });
  // console.log(returnData);
  return returnData;
};
