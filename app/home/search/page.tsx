"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import {
  advancedFuzzySearchUsers,
  globalSearch,
  searchLogsByCriteria,
} from "../../_db/searchService";
import { followUser, getFriends } from "../../_db/db";
import { SearchResultItem } from "../../../types/index";
import { logError } from "../../../lib/utils/errorLogger";
import { Input, Button, Card, Alert } from "../../_components/DesignSystem";
import { FollowButton } from "../../_components/FollowButton";
import { UserAuth } from "../../context/AuthContext";

const SearchPage: React.FC = () => {
  const { user: currentUser } = UserAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [minDuration, setMinDuration] = useState<string>("");
  const [maxDuration, setMaxDuration] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{
    users: SearchResultItem[];
    logs: SearchResultItem[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");
  const [friends, setFriends] = useState<string[]>([]);

  useEffect(() => {
    const loadFriends = async () => {
      if (currentUser?.uid) {
        try {
          const friendsList = await getFriends(currentUser.uid);
          setFriends(friendsList);
        } catch (error) {
          logError(
            "Failed to load friends list",
            error instanceof Error ? error : new Error("Unknown error"),
            {
              component: "search",
              function: "loadFriends",
              metadata: { userId: currentUser.uid },
            }
          );
        }
      }
    };

    loadFriends();
  }, [currentUser?.uid]);

  const handleFollowUser = async (targetUserId: string) => {
    if (!currentUser?.uid) {
      setError("You must be logged in to follow users");
      return;
    }

    try {
      await followUser(currentUser.uid, targetUserId);
      setFriends((prev) => [...prev, targetUserId]);
    } catch (error) {
      if (error instanceof Error) {
        logError("Failed to follow user from search page", error, {
          component: "search",
          function: "handleFollowUser",
          metadata: { currentUserId: currentUser.uid, targetUserId },
        });
        setError("Failed to follow user. Please try again.");
      }
      throw error;
    }
  };

  const handleSearch = async () => {
    if (activeTab === "basic" && !searchTerm.trim()) {
      setError("Please enter a search term");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (activeTab === "basic") {
        const results = await globalSearch(searchTerm, 20);
        setSearchResults(results);
      } else {
        const criteria: {
          searchText?: string;
          tags?: string[];
          startDate?: string;
          endDate?: string;
          minDuration?: number;
          maxDuration?: number;
        } = {};

        if (searchTerm.trim()) {
          criteria.searchText = searchTerm;
        }

        if (selectedTags.length > 0) {
          criteria.tags = selectedTags;
        }

        if (minDuration) {
          criteria.minDuration = parseInt(minDuration) || 0;
        }

        if (maxDuration) {
          criteria.maxDuration =
            parseInt(maxDuration) || Number.MAX_SAFE_INTEGER;
        }

        const logResults = await searchLogsByCriteria(criteria, 20);
        const userResults = searchTerm
          ? await advancedFuzzySearchUsers(searchTerm, 10)
          : [];

        setSearchResults({ users: userResults, logs: logResults });
      }
    } catch (err) {
      if (err instanceof Error) {
        logError("Search failed", err, {
          component: "search",
          function: "handleSearch",
          metadata: { searchTerm, activeTab },
        });
        setError(err.message || "Search failed. Please try again.");
      }
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Search</h1>

      <Card className={styles.mb4}>
        <div className={styles.mb4}>
          <div className={styles.tabContainer}>
            <Button
              variant={activeTab === "basic" ? "primary" : "secondary"}
              onClick={() => setActiveTab("basic")}
              className={styles.tabButton}
            >
              Basic Search
            </Button>
            <Button
              variant={activeTab === "advanced" ? "primary" : "secondary"}
              onClick={() => setActiveTab("advanced")}
              className={styles.tabButton}
            >
              Advanced Filters
            </Button>
          </div>

          {activeTab === "basic" ? (
            <div className={styles.searchInputContainer}>
              <Input
                type="text"
                placeholder="Search users, tags, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className={styles.searchInput}
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading || !searchTerm.trim()}
                isLoading={isLoading}
              >
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          ) : (
            <div className={styles.spaceY4}>
              <Input
                type="text"
                placeholder="Search in descriptions and tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />

              <div className={styles.tagsSection}>
                <label htmlFor="tag-input" className={styles.tagsLabel}>
                  Tags
                </label>
                <div className={styles.tagsInputContainer}>
                  <Input
                    id="tag-input"
                    type="text"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    className={styles.searchInput}
                  />
                  <Button onClick={addTag} size="sm">
                    Add
                  </Button>
                </div>
                {selectedTags.length > 0 && (
                  <div className={styles.tagsList}>
                    {selectedTags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className={styles.removeTagButton}
                          aria-label={`Remove ${tag} tag`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.durationGrid}>
                <Input
                  type="number"
                  placeholder="Min duration (minutes)"
                  value={minDuration}
                  onChange={(e) => setMinDuration(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max duration (minutes)"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSearch}
                disabled={isLoading}
                isLoading={isLoading}
                className={styles.searchButton}
              >
                {isLoading ? "Searching..." : "Search with Filters"}
              </Button>
            </div>
          )}
        </div>

        {activeTab === "basic" &&
          searchTerm.length > 0 &&
          searchTerm.length < 2 && (
            <p className={styles.helpText}>
              Enter at least 2 characters for better results
            </p>
          )}
      </Card>

      {error && (
        <div className={styles.mb4}>
          <Alert variant="error" title="Search Error">
            {error}
          </Alert>
        </div>
      )}

      {searchResults && (
        <div className={styles.resultsGrid}>
          {/* Users Results */}
          <div className={styles.resultsColumn}>
            <h2 className={styles.resultsTitle}>
              Users ({searchResults.users.length})
            </h2>
            {searchResults.users.length === 0 ? (
              <Card className={styles.emptyCard}>
                <p className={styles.emptyText}>No users found</p>
              </Card>
            ) : (
              searchResults.users.map((user) => {
                const isCurrentUser = currentUser?.uid === user.id;
                const isFollowing = friends.includes(user.id);

                return (
                  <Card key={user.id} className={styles.userCard}>
                    <Link
                      href={`/home/user?userId=${user.id}`}
                      className={styles.userLink}
                    >
                      <div className={styles.userCardContent}>
                        <div className={styles.userAvatar}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.userInfo}>
                          <h3 className={styles.userName}>{user.name}</h3>
                          {user.description && (
                            <p className={styles.userDescription}>
                              {user.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                    {!isCurrentUser && (
                      <FollowButton
                        targetUserId={user.id}
                        isFollowing={isFollowing}
                        onFollow={() => handleFollowUser(user.id)}
                        size="sm"
                      />
                    )}
                  </Card>
                );
              })
            )}
          </div>

          {/* Logs Results */}
          <div className={styles.resultsColumn}>
            <h2 className={styles.resultsTitle}>
              Logs ({searchResults.logs.length})
            </h2>
            {searchResults.logs.length === 0 ? (
              <Card className={styles.emptyCard}>
                <p className={styles.emptyText}>No logs found</p>
              </Card>
            ) : (
              searchResults.logs.map((log) => {
                // Extract userId from log.id if it exists (format is "userId_logId")
                const logParts = log.id?.split("_");
                const userId =
                  logParts && logParts.length > 0 ? logParts[0] : log.userId;

                return (
                  <Card key={log.id} className={styles.logCard}>
                    <div>
                      <Link href={`/home/user?userId=${userId}`}>
                        <h3 className={styles.logName}>{log.name}</h3>
                      </Link>
                      {log.description && (
                        <p className={styles.logDescription}>
                          {log.description}
                        </p>
                      )}
                      {log.tags && (
                        <div className={styles.tagsContainer}>
                          {log.tags.map((tag, index) => (
                            <span key={index} className={styles.logTag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
