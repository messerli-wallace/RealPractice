# RealPractice Data Model Restructuring

## Current Data Model Issues

1. **Monolithic User Documents**: All user data (profile, logs, friends) stored in single documents
2. **Array Limitations**: Logs stored as arrays with 20-item limit in Firestore queries
3. **Inefficient Queries**: Difficult to query logs across multiple users
4. **Scalability Problems**: Large user documents become slow to read/write
5. **No Proper Indexing**: Missing indexes for efficient search operations

## Proposed Data Model

### 1. Collections Structure

```
users/ (User profiles)
  {userId}
    - name: string
    - email: string
    - bio: string
    - profilePicture: string
    - createdAt: timestamp
    - updatedAt: timestamp
    - lastActive: timestamp

userLogs/ (Separate logs collection)
  {logId}
    - userId: string (reference)
    - dateTimeStr: string
    - duration: string
    - description: string
    - tags: string[]
    - createdAt: timestamp
    - updatedAt: timestamp
    - visibility: "public" | "friends" | "private"
    - location?: string
    - mood?: string

socialConnections/ (Friend relationships)
  {userId}
    - friends: string[] (user IDs)
    - followers: string[] (user IDs)
    - following: string[] (user IDs)
    - friendRequests: string[] (pending requests)

logIndexes/ (Search indexes)
  byUser_{userId}
    - logIds: string[] (references to userLogs)

  byTag_{tagName}
    - logIds: string[] (references to userLogs)

  byDate_{yyyy-mm-dd}
    - logIds: string[] (references to userLogs)
```

### 2. Benefits of Restructured Model

1. **Scalability**: Separate collections allow for unlimited growth
2. **Efficient Queries**: Direct queries on logs without loading entire user profiles
3. **Better Performance**: Smaller documents load faster
4. **Flexible Search**: Indexed collections enable efficient search operations
5. **Data Isolation**: Changes to one collection don't affect others

### 3. Migration Plan

1. **Phase 1**: Create new collections alongside existing structure
2. **Phase 2**: Implement dual-write to both old and new structures
3. **Phase 3**: Gradually migrate existing data
4. **Phase 4**: Update all queries to use new structure
5. **Phase 5**: Deprecate old structure

### 4. Implementation Steps

1. Create new database service functions for the restructured model
2. Update all existing components to use new data access patterns
3. Implement data migration scripts
4. Add comprehensive testing for new data model

### 5. Query Examples

**Get user profile:**

```javascript
// Old: get user document with all data
db.collection("users").doc(userId).get();

// New: get only profile data
db.collection("users").doc(userId).get();
```

**Get user logs:**

```javascript
// Old: get user document and extract logs array
db.collection("users")
  .doc(userId)
  .get()
  .then((doc) => doc.data().logs);

// New: query logs collection directly
db.collection("userLogs").where("userId", "==", userId).get();
```

**Search by tag:**

```javascript
// Old: query all users, filter logs client-side
// (Very inefficient!)

// New: use indexed collection
db.collection("logIndexes").doc(`byTag_${tag}`).get();
```

## Backward Compatibility

During migration, maintain both structures and implement fallback logic:

```typescript
async function getUserLogs(userId: string): Promise<LogItem[]> {
  try {
    // Try new structure first
    const newLogs = await getLogsFromNewStructure(userId);
    if (newLogs.length > 0) return newLogs;

    // Fallback to old structure
    const oldLogs = await getLogsFromOldStructure(userId);
    return oldLogs;
  } catch (error) {
    // Comprehensive error handling
    logError("Failed to get user logs", error);
    return [];
  }
}
```

## Indexing Strategy

1. **Automatic Firestore Indexes**: Use Firestore's built-in indexing for common queries
2. **Manual Index Collections**: Create separate collections for complex search patterns
3. **Denormalization**: Store redundant data for performance-critical operations
4. **Cache Layer**: Implement client-side caching for frequently accessed data

This restructured data model provides a solid foundation for the application's growth while maintaining performance and scalability.
