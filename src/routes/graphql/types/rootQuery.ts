import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { MemberType } from './memberType.js';
import { PostType } from './post.js';
import { UserType } from './user.js';
import { UUIDType } from './uuid.js';
import { ProfileType } from './profile.js';
import { PrismaClient } from '@prisma/client';
import {
  memberTypeLoader,
  profileLoader,
  userLoader,
  postLoader,
} from '../dataLoader.js';
import { parseResolveInfo } from 'graphql-parse-resolve-info';
import { MemberTypeIdEnum } from './enum.js';

const prisma = new PrismaClient();

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async () => {
        const memberTypes = await prisma.memberType.findMany();
        memberTypes.forEach((memberType) =>
          memberTypeLoader.prime(memberType.id, memberType),
        );
        return memberTypes;
      },
    },
    memberType: {
      type: MemberType as GraphQLObjectType,
      args: { id: { type: new GraphQLNonNull(MemberTypeIdEnum) } },
      resolve: async (_, args: { id: string }) => {
        return await prisma.memberType.findUnique({
          where: { id: args.id },
        });
      },
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (_, __, context, info) => {
        const parsedResolveInfo = parseResolveInfo(info);
        const fields = parsedResolveInfo?.fieldsByTypeName.User || {};
        const include: Record<string, boolean> = {};

        if ('userSubscribedTo' in fields) {
          include.userSubscribedTo = true;
        }
        if ('subscribedToUser' in fields) {
          include.subscribedToUser = true;
        }

        const users = await prisma.user.findMany({ include });
        users.forEach((user) => userLoader.prime(user.id, user));
        return users;
      },
    },
    user: {
      type: UserType as GraphQLObjectType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args: { id: string }, context) => {
        return await userLoader.load(args.id);
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
      resolve: async () => {
        const posts = await prisma.post.findMany();
        return posts;
      },
    },
    post: {
      type: PostType as GraphQLObjectType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args: { id: string }) => {
        return await prisma.post.findUnique({
          where: { id: args.id },
        });
      },
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProfileType))),
      resolve: async () => {
        const profiles = await prisma.profile.findMany();
        profiles.forEach((profile) => profileLoader.prime(profile.id, profile));
        return profiles;
      },
    },
    profile: {
      type: ProfileType as GraphQLObjectType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args: { id: string }) => {
        return await prisma.profile.findUnique({
          where: { id: args.id },
        });
      },
    },
  },
});

export { RootQuery };
