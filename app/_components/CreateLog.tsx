"use client";

import { UserAuth } from "../context/AuthContext";
import { addLog } from "../_db/db";
import { logError, createComponentContext } from "../../lib/utils/errorLogger";
import { LogItem } from "../../types/index";
import { CreateLogForm } from "./CreateLogForm";
import { LogFormData } from "./CreateLogForm/types";
import styles from "./CreateLog.module.css";

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
          createdAt: new Date().toISOString(),
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
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.header}>
              <h1 className={styles.title}>New Practice Log</h1>
              <p className={styles.subtitle}>Record your practice session</p>
            </div>

            {user ? (
              <CreateLogForm onSubmit={handleSubmit} />
            ) : (
              <div className={styles.warningBox}>
                <div className={styles.warningContent}>
                  <div className={styles.warningIcon}>
                    <svg
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
                  <div className={styles.warningText}>
                    <p className={styles.warningMessage}>
                      Sign in to add a log.
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
