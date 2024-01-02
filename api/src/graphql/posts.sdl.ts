export const schema = gql`
  type Post {
    id: Int!
    title: String!
    body: String!
  }

  type Query {
    posts(orgId: Int!): [Post!]! @requireAuth @requireOrg(input: "orgId")
    post(postId: Int!, orgId: Int!): Post
      @requireAuth
      @requireScope(input: "orgId", scope: "read:post")
  }

  input CreatePostInput {
    title: String!
    body: String!
  }

  input UpdatePostInput {
    title: String
    body: String
  }

  type Mutation {
    createPost(orgId: Int!, input: CreatePostInput!): Post!
      @requireAuth
      @requireScope(input: "orgId", scope: "create:post")
    updatePost(postId: Int!, orgId: Int!, input: UpdatePostInput!): Post!
      @requireAuth
      @requireScope(input: "orgId", scope: "update:post")
    deletePost(postId: Int!, orgId: Int!): Post!
      @requireAuth
      @requireScope(input: "orgId", scope: "delete:post")
  }
`
