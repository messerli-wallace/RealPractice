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


## Indexing Strategy

1. **Automatic Firestore Indexes**: Use Firestore's built-in indexing for common queries
2. **Manual Index Collections**: Create separate collections for complex search patterns
3. **Denormalization**: Store redundant data for performance-critical operations
4. **Cache Layer**: Implement client-side caching for frequently accessed data

This restructured data model provides a solid foundation for the application's growth while maintaining performance and scalability.
