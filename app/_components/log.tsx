import React from "react";
import LikeButton from "./like-button";

interface LogProps {
  log: {
    user: string;
    dateTimeStr: string;
    duration: string;
    tags: string[];
    description: string | null;
    index: number;
  };
}

export const Log: React.FC<LogProps> = ({ log }) => {
  return (
    <div className="log">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-lg sm:text-xl font-semibold">Log</h2>
        <LikeButton logId={log.index?.toString()} />
      </div>
      <p className="text-sm sm:text-base">
        <strong>Index:</strong> {log.index}
      </p>
      <p className="text-sm sm:text-base">
        <strong>User:</strong> {log.user}
      </p>
      <p className="text-sm sm:text-base">
        <strong>Date:</strong> {log.dateTimeStr}
      </p>
      <p className="text-sm sm:text-base">
        <strong>Duration:</strong> {log.duration}
      </p>
      <p className="text-sm sm:text-base flex flex-wrap gap-1">
        <strong>Tags:</strong>{" "}
        {log.tags.map((tag, idx) => (
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
        {log.description || "No description available"}
      </p>
    </div>
  );
};

export default Log;
