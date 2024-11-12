import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { UserType, CreateUserInput, ChangeUserInput } from './user.js';
import { ProfileType, CreateProfileInput, ChangeProfileInput } from './profile.js';
import { PostType, CreatePostInput, ChangePostInput } from './post.js';
import { UUIDType } from './uuid.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface IContext {
  prisma: PrismaClient;
  userLoader: {
    clear: (id: string) => void;
  };
}

interface CreateUserArgs {
  dto: {
    name: string;
    balance: number;
  };
}

interface CreateProfileArgs {
  dto: {
    isMale: boolean;
    yearOfBirth: number;
    memberTypeId: string;
    userId: string;
  };
}

interface ChangeProfileArgs {
  id: string;
  dto: {
    isMale?: boolean;
    yearOfBirth?: number;
    memberTypeId?: string;
  };
}

interface CreatePostArgs {
  dto: {
    title: string;
    content: string;
    authorId: string;
  };
}

interface ChangePostArgs {
  id: string;
  dto: {
    title?: string;
    content?: string;
  };
}

interface ChangeUserArgs {
  id: string;
  dto: {
    name?: string;
    balance?: number;
  };
}

interface DeleteArgs {
  id: string;
}

interface SubscribeArgs {
  userId: string;
  authorId: string;
}

const Mutations = new GraphQLObjectType({
  name: 'Mutations',
  fields: () => ({
    createUser: {
      type: new GraphQLNonNull(UserType),
      args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
      resolve: async (_: unknown, args: CreateUserArgs, context: IContext) => {
        const { name, balance } = args.dto;
        return await context.prisma.user.create({
          data: { name, balance },
        });
      },
    },
    createProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
      resolve: async (_: unknown, args: CreateProfileArgs, context: IContext) => {
        return await context.prisma.profile.create({
          data: args.dto,
        });
      },
    },
    createPost: {
      type: new GraphQLNonNull(PostType),
      args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
      resolve: async (_: unknown, args: CreatePostArgs, context: IContext) => {
        const { title, content, authorId } = args.dto;
        return await context.prisma.post.create({
          data: {
            title,
            content,
            author: { connect: { id: authorId } },
          },
        });
      },
    },
    changePost: {
      type: new GraphQLNonNull(PostType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: async (_: unknown, args: ChangePostArgs, context: IContext) => {
        const post = await context.prisma.post.update({
          where: { id: args.id },
          data: args.dto,
        });
        return post;
      },
    },
    changeProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: async (_: unknown, args: ChangeProfileArgs, context: IContext) => {
        return await context.prisma.profile.update({
          where: { id: args.id },
          data: args.dto,
        });
      },
    },
    changeUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: async (_: unknown, args: ChangeUserArgs, context: IContext) => {
        context.userLoader.clear(args.id);
        return await context.prisma.user.update({
          where: { id: args.id },
          data: args.dto,
        });
      },
    },
    deleteUser: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_: unknown, args: DeleteArgs, context: IContext) => {
        context.userLoader.clear(args.id);
        await context.prisma.user.delete({
          where: { id: args.id },
        });
        return null;
      },
    },
    deletePost: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_: unknown, args: DeleteArgs, context: IContext) => {
        await context.prisma.post.delete({
          where: { id: args.id },
        });
        return null;
      },
    },
    deleteProfile: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_: unknown, args: DeleteArgs, context: IContext) => {
        await context.prisma.profile.delete({
          where: { id: args.id },
        });
        return null;
      },
    },
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_: unknown, args: SubscribeArgs, context: IContext) => {
        context.userLoader.clear(args.userId);
        await context.prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: args.userId,
            authorId: args.authorId,
          },
        });
        return `User with id ${args.userId} subscribed to author with id ${args.authorId}`;
      },
    },
    unsubscribeFrom: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_: unknown, args: SubscribeArgs, context: IContext) => {
        context.userLoader.clear(args.userId);
        await context.prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: args.userId,
              authorId: args.authorId,
            },
          },
        });
        return `User with id ${args.userId} unsubscribed from author with id ${args.authorId}`;
      },
    },
  }),
});

export default Mutations;
