"use client";
import React, { useState } from "react";
import { queryUserByName } from "../search/query.tsx";
import { SearchResult } from "../../../types";

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const handleSearch = async () => {
    const searchResult = await queryUserByName(searchTerm);
    setSearchResult(searchResult);
  };

  return (
    <div>
      <br></br>
      <h1>Search Page</h1>
      <input
        type="text"
        placeholder="Enter search term"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {searchResult && (
        <div>
          <h2>Search Result:</h2>
          <pre>{JSON.stringify(searchResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default HomePage;
