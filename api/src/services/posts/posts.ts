import type {
  QueryResolvers,
  MutationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const posts: QueryResolvers['posts'] = ({ orgId }) => {
  return db.post.findMany({
    where: {
      Organization: {
        id: orgId
      }
    }
  })
}

export const post: QueryResolvers['post'] = ({ postId }) => {
  return db.post.findUnique({
    where: { id: postId },
  })
}

export const createPost: MutationResolvers['createPost'] = ({ orgId, input }) => {
  return db.post.create({
    data: {
      ...input,
      Organization: {
        connect: {
          id: orgId
        }
      }
    }
  })
}

export const updatePost: MutationResolvers['updatePost'] = ({ postId, input }) => {
  return db.post.update({
    data: input,
    where: { id: postId },
  })
}

export const deletePost: MutationResolvers['deletePost'] = ({ postId }) => {
  return db.post.delete({
    where: { id: postId },
  })
}

