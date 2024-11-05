import {
  GraphQLObjectType,
  GraphQLFieldConfigMap,
  GraphQLNonNull,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLInputObjectType,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { User, PrismaClient } from '@prisma/client';
import { ProfileType } from './profile.js';
import { PostType } from './post.js';
import { postLoader, profileLoader, userLoader } from '../dataLoader.js';

interface UserSubscription {
  subscriberId: string;
  authorId: string;
}

interface CustomUser extends User {
  userSubscribedTo: UserSubscription[];
  subscribedToUser: UserSubscription[];
}

const prisma = new PrismaClient();

export const UserType = new GraphQLObjectType<CustomUser>({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: ProfileType as GraphQLObjectType,
      resolve: (user: CustomUser) => profileLoader.load(user.id),
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: (user: CustomUser) => postLoader.load(user.id),
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (customUser: CustomUser, _args, context) => {
        const authorIds = customUser.userSubscribedTo.map((user) => user.authorId);
        return await userLoader.loadMany(authorIds);
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (customUser: CustomUser, _args, context) => {
        const subsIds = customUser.subscribedToUser.map((user) => user.subscriberId);
        return await userLoader.loadMany(subsIds);
      },
    },
  }),
});

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});
