import LikeButton from "../_components/like-button";
import CreateLog from "../_components/CreateLog";

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
}