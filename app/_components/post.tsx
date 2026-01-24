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
      <h2 className="text-lg sm:text-xl font-semibold mb-2">Post</h2>
      <p className="text-sm sm:text-base">
        <strong>Index:</strong> {post.index}
      </p>
      <p className="text-sm sm:text-base">
        <strong>User:</strong> {post.user}
      </p>
      <p className="text-sm sm:text-base">
        <strong>Date:</strong> {post.dateTimeStr}
      </p>
      <p className="text-sm sm:text-base">
        <strong>Duration:</strong> {post.duration}
      </p>
      <p className="text-sm sm:text-base flex flex-wrap gap-1">
        <strong>Tags:</strong>{" "}
        {post.tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs sm:text-sm"
          >
            {tag}
          </span>
        ))}
      </p>
      <p className="text-sm sm:text-base mt-2 break-words">
        <strong>Description:</strong>{" "}
        {post.description || "No description available"}
      </p>
    </div>
  );
};

export default Post;
