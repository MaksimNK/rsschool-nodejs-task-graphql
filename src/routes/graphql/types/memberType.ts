import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLList,
} from 'graphql';
import { ProfileType } from './profile.js';
import { PrismaClient, MemberType as Member } from '@prisma/client';
import { MemberTypeIdEnum } from './enum.js'; // Import from enum.js

const prisma = new PrismaClient();

export const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: GraphQLInt },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async (obj: Member, _args) => {
        return await prisma.profile.findMany({ where: { memberTypeId: obj.id } });
      },
    },
  }),
});
