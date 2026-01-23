"use client";
import React, { useState } from "react";
import {
  advancedFuzzySearchUsers,
  globalSearch,
  searchLogsByCriteria,
} from "../../_db/searchService";
import { SearchResultItem } from "../../../types/index";
import { logError } from "../../../lib/utils/errorLogger";
import { Input, Button, Card, Alert } from "../../_components/DesignSystem";

const SearchPage: React.FC = () => {
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
        // Advanced search with criteria
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
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      <Card className="mb-6">
        <div className="mb-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === "basic" ? "primary" : "secondary"}
              onClick={() => setActiveTab("basic")}
              className="flex-1"
            >
              Basic Search
            </Button>
            <Button
              variant={activeTab === "advanced" ? "primary" : "secondary"}
              onClick={() => setActiveTab("advanced")}
              className="flex-1"
            >
              Advanced Filters
            </Button>
          </div>

          {activeTab === "basic" ? (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search users, tags, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
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
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Search in descriptions and tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />

              <div>
                <label
                  htmlFor="tag-input"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tags
                </label>
                <div className="flex gap-2">
                  <Input
                    id="tag-input"
                    type="text"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    className="flex-1"
                  />
                  <Button onClick={addTag} size="sm">
                    Add
                  </Button>
                </div>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                          aria-label={`Remove ${tag} tag`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                className="w-full"
              >
                {isLoading ? "Searching..." : "Search with Filters"}
              </Button>
            </div>
          )}
        </div>

        {activeTab === "basic" &&
          searchTerm.length > 0 &&
          searchTerm.length < 2 && (
            <p className="text-sm text-gray-500 mt-2">
              Enter at least 2 characters for better results
            </p>
          )}
      </Card>

      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Search Error">
            {error}
          </Alert>
        </div>
      )}

      {searchResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Users Results */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Users ({searchResults.users.length})
            </h2>
            {searchResults.users.length === 0 ? (
              <Card className="p-4 text-center">
                <p className="text-gray-500">No users found</p>
              </Card>
            ) : (
              searchResults.users.map((user) => (
                <Card key={user.id} className="mb-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      {user.description && (
                        <p className="text-sm text-gray-600">
                          {user.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Logs Results */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Logs ({searchResults.logs.length})
            </h2>
            {searchResults.logs.length === 0 ? (
              <Card className="p-4 text-center">
                <p className="text-gray-500">No logs found</p>
              </Card>
            ) : (
              searchResults.logs.map((log) => (
                <Card key={log.id} className="mb-3 p-4">
                  <div>
                    <h3 className="font-medium mb-1">{log.name}</h3>
                    {log.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {log.description}
                      </p>
                    )}
                    {log.tags && (
                      <div className="flex flex-wrap gap-1">
                        {log.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
