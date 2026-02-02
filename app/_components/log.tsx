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
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Practice Log</h2>
          <LikeButton logId={log.index?.toString()} />
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              User
            </p>
            <p className="text-sm font-medium text-gray-800">{log.user}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Duration
            </p>
            <p className="text-sm font-medium text-gray-800">{log.duration}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Date & Time
          </p>
          <p className="text-sm text-gray-800">{log.dateTimeStr}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {log.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Description
          </p>
          <p className="text-sm text-gray-700 leading-relaxed break-words bg-gray-50 rounded-lg p-3 border-l-4 border-indigo-500">
            {log.description || "No description provided"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Log;
