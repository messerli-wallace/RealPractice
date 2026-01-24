"use client";

import { UserAuth } from "../context/AuthContext";
import { addLog } from "../_db/db";
import { logError, createComponentContext } from "../../lib/utils/errorLogger";
import { LogItem } from "../../types/index";
import { CreateLogForm } from "./CreateLogForm";
import { LogFormData } from "./CreateLogForm/types";

export default function CreateLog() {
  const errorContext = createComponentContext("CreateLog");
  const { user } = UserAuth();

  const handleSubmit = async (data: LogFormData) => {
    try {
      if (user) {
        const logPath = user.uid;
        const logItem: LogItem = {
          id: crypto.randomUUID(),
          ...data,
          createdAt: Date.now().toString(),
        };
        await addLog(logPath, logItem);
      }
    } catch (error) {
      if (error instanceof Error) {
        logError(
          "Failed to submit practice log",
          error,
          errorContext.withUser(user)
        );
      }
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                New Practice Log
              </h1>
              <p className="text-gray-600">Record your practice session</p>
            </div>

            {user ? (
              <CreateLogForm onSubmit={handleSubmit} className="space-y-6" />
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.493-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-yellow-700">
                      You must be logged in to add a log.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
