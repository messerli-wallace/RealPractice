import {
  collection,
  getDocs,
  query,
  where,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { UserLogData, OrganizedLogEntry } from "../../types";

export async function getRecentPosts(name: string) {
  const allFriendData: UserLogData[] = [];
  const userdata = await getFriends(name);
  const flattenedUserData = userdata.flat();
  for (const friendName of flattenedUserData) {
    const friendData = await queryUserByName(friendName);
    allFriendData.push(...friendData); // Spread the array elements instead of pushing the array itself
  }

  const sortedData = organizeAndSortData(allFriendData); // Sort the data by datetime
  return sortedData;
}

const getFriends = async (search: string): Promise<string[]> => {
  const coll = collection(db, "users");
  const q = query(coll, where("name", "==", search));

  const targetAccounts = await getDocs(q);
  const friendsArrays: string[] = [];
  friendsArrays.push(search);
  targetAccounts.forEach((doc) => {
    const data = doc.data();
    if (Object.prototype.hasOwnProperty.call(data, "friends")) {
      friendsArrays.push(...data.friends);
    }
  });

  return friendsArrays;
};

const queryUserByName = async (search: string): Promise<UserLogData[]> => {
  const coll = collection(db, "users");
  const q = query(coll, where("name", "==", search));

  const targetAccounts = await getDocs(q);

  return targetAccounts.docs.map((doc: DocumentSnapshot) => {
    const data = doc.data();
    if (data && data.logs) {
      return { [doc.id]: data.logs.slice(0, 10) };
    } else {
      return { [doc.id]: [] }; // Return empty array if logs are not available
    }
  });
};

function organizeAndSortData(userData: UserLogData[]): OrganizedLogEntry[] {
  // Flatten and organize the data into the desired format
  const organizedData: OrganizedLogEntry[] = [];

  userData.forEach((user) => {
    const userKeys = Object.keys(user);
    const userName = userKeys[0];

    user[userName].forEach((activity) => {
      const { dateTimeStr, duration, tags, description } = activity;
      organizedData.push({
        user: userName,
        dateTimeStr,
        duration,
        tags,
        description,
      });
    });
  });

  // Sort the organized data by dateTimeStr
  organizedData.sort((a, b) => {
    return Number(a.dateTimeStr) - Number(b.dateTimeStr);
  });

  return organizedData;
}
