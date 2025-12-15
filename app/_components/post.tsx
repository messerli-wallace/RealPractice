import React from "react";

interface PostProps {
  post: {
    user: string;
    dateTimeStr: string;
    duration: string;
    tags: string[];
    description: string | null;
    index: number;
  };
}

export const Post: React.FC<PostProps> = ({ post }) => {
  return (
    <div className="post">
      <h2>Post</h2>
      <p>
        <strong>Index:</strong> {post.index}
      </p>
      <p>
        <strong>User:</strong> {post.user}
      </p>
      <p>
        <strong>Date:</strong> {post.dateTimeStr}
      </p>
      <p>
        <strong>Duration:</strong> {post.duration}
      </p>
      <p>
        <strong>Tags:</strong> {post.tags.join(", ")}
      </p>
      <p>
        <strong>Description:</strong>{" "}
        {post.description || "No description available"}
      </p>
      <br />
    </div>
  );
};

export default Post;
