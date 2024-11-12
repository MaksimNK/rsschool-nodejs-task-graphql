import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInputObjectType,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { MemberType } from './memberType.js';
import { PrismaClient, Profile } from '@prisma/client';
import { memberTypeLoader, userLoader } from '../dataLoader.js';
import { UserType } from './user.js';
import { MemberTypeIdEnum } from './enum.js';

const prisma = new PrismaClient();

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeIdEnum },
    user: {
      type: UserType as GraphQLObjectType,
      resolve: async (obj: Profile, _args) => {
        return await userLoader.load(obj.userId);
      },
    },
    memberType: {
      type: MemberType as GraphQLObjectType,
      resolve: async (profile: Profile) => {
        const memberType = await memberTypeLoader.load(profile.memberTypeId);
        return memberType;
      },
    },
  }),
});

export const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdEnum) },
    userId: { type: new GraphQLNonNull(UUIDType) },
  },
});

export const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeIdEnum },
  },
});

// type Profile {
//   id: UUID!
//   isMale: Boolean!
//   yearOfBirth: Int!
//   memberType: MemberType!
// }
