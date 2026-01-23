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
    <div className="p-4">
      <h1 className="text-2xl">New Log</h1>
      {user ? (
        <CreateLogForm
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md"
        />
      ) : (
        <div className="p-4">You must be logged in to add a log.</div>
      )}
    </div>
  );
}
