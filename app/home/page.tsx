"use client";
import React, { useEffect, useState } from "react";
import { getRecentPosts } from "../_db/post_feed.tsx";
import CreateLog from "../_components/CreateLog";
import LikeButton from "../_components/like-button";
import Post from "../_components/post";

export default function Home() {
  const [recentPosts, setRecentPosts] = useState<
    {
      user: string;
      dateTimeStr: string;
      duration: string;
      tags: string[];
      description: string | null;
    }[]
  >([]);

  useEffect(() => {
    async function fetchRecentPosts() {
      try {
        const posts = await getRecentPosts("Jack M");
        setRecentPosts(posts);
      } catch (error) {
        console.error("Error fetching recent posts:", error);
      }
    }
    fetchRecentPosts();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Home</h1>
      <div>
        <CreateLog />
      </div>
      <div>
        <h1>Recent Posts</h1>

        {recentPosts.map((post, index) => (
          <React.Fragment key={index}>
            <LikeButton />
            <Post key={index} post={{ ...post, index }} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
