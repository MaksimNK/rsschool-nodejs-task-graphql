import {
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { UserType } from './user.js';
import { userLoader } from '../dataLoader.js';
import { Post } from '@prisma/client';
import { MemberTypeIdEnum } from './enum.js';

export const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
    author: {
      type: UserType as GraphQLObjectType,
      resolve: async (obj: Post, _args) => {
        return await userLoader.load(obj.authorId);
      },
    },
  }),
});

export const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
});

export const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});

// type Post {
//   id: UUID!
//   title: String!
//   content: String!
// }
