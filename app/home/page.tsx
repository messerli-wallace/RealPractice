import LikeButton from "../_components/like-button";
import CreateLog from "../_components/CreateLog";
import React from 'react';
import { db, createData, readData, updateData, deleteData} from "../db.js"; 

//Example usage of the database functions 
const YourPage = () => {
  const fetchData = async () => {
      try {
        const result = await createData(
        'users', {'email':'bruh2@gmail.com', 
        'prof_pic': 'bru.jpg',
        'username': 'jack2'});
        const userData = await readData('users');
        console.log('Read Data:', userData);
        
        await updateData('users', {'email': 'jack@gmail.com'});
        await deleteData('users');
      } catch (error) {
        console.error('Error writing data:', error);
      }
    };
};

//export default YourPage;



export default function homePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold underline">Home</h1>
      <div>
        <p>This is where the 'new log' form will be.</p>
      </div>
      <div>
        <p>This is where the feed will be.</p>
      </div>
      
      <LikeButton />


      {/*  */}
    </div>
  );
  };
