import { collection, getDocs, query, where, DocumentSnapshot} from "firebase/firestore";
import { db } from "/app/firebase.tsx";


export async function getRecentPosts(name) {
    console.log("bruh");
    const allFriendData: any[] = [];
    const userdata = await getFriends(name);
    const flattenedUserData = userdata.flat();
    for (const friendName of flattenedUserData) {
        const friendData = await queryUserByName(friendName);
        console.log(`Data for ${friendName}:`, friendData);
        allFriendData.push(friendData);
    }
    const flattendallFriendData = allFriendData.flat();

    const sortedData = organizeAndSortData(flattendallFriendData); // Sort the data by datetime
    return sortedData
};


const getFriends = async (search: string): Promise<any> => {
    const coll = collection(db, "users");
    const q = query(coll, where("name", "==", search));

    const targetAccounts = await getDocs(q);
    const friendsArrays: any[] = [];
    friendsArrays.push(search);
    targetAccounts.forEach((doc) => {
        const data = doc.data();
        if (data.hasOwnProperty("friends")) {
            friendsArrays.push(data.friends);
        }
    });

    return friendsArrays;
};

const queryUserByName = async (search: string): Promise<{ [key: string]: any[] }[]> => {
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


function organizeAndSortData(userData: { [key: string]: { dateTimeStr: string; duration: string; tags: string[]; description: string | null }[]}[]): { user: string; dateTimeStr: string; duration: string; tags: string[]; description: string | null }[] {
    // Flatten and organize the data into the desired format
    const organizedData: { user: string; dateTimeStr: string; duration: string; tags: string[]; description: string | null }[] = [];

    userData.forEach(user => {
        const userKeys = Object.keys(user);
        const userName = userKeys[0];

        user[userName].forEach(activity => {
            const { dateTimeStr, duration, tags, description } = activity;
            organizedData.push({
                user: userName,
                dateTimeStr,
                duration,
                tags,
                description
            });
        });
    });

    // Sort the organized data by dateTimeStr
    organizedData.sort((a, b) => {
        return Number(a.dateTimeStr) - Number(b.dateTimeStr);
    });

    return organizedData;
}