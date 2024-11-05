import { PrismaClient, Post, User, MemberType } from '@prisma/client';
import DataLoader from 'dataloader';

const prisma = new PrismaClient();

export const userLoader = new DataLoader<string, User | null>(async (userIds) => {
  const users = await prisma.user.findMany({
    where: { id: { in: userIds as string[] } },
    include: {
      profile: {
        include: {
          memberType: true,
        },
      },
      userSubscribedTo: true,
      subscribedToUser: true,
    },
  });

  const usersMap = new Map(users.map((user) => [user.id, user]));
  return userIds.map((userId) => usersMap.get(userId) || null);
});

export const profileLoader = new DataLoader(async (profileIds: readonly string[]) => {
  const profiles = await prisma.profile.findMany({
    where: { userId: { in: Array.from(profileIds) } },
  });
  const profilesMap = new Map(profiles.map((profile) => [profile.userId, profile]));
  return profileIds.map((profileId) => profilesMap.get(profileId) || null);
});

export const postLoader = new DataLoader(async (authorIds: readonly string[]) => {
  const posts = await prisma.post.findMany({
    where: { authorId: { in: Array.from(authorIds) } },
  });

  const postsMap = new Map(authorIds.map((authorId) => [authorId, [] as Post[]]));
  posts.forEach((post) => {
    postsMap.get(post.authorId)?.push(post);
  });

  return authorIds.map((authorId) => postsMap.get(authorId) || []);
});

export const memberTypeLoader = new DataLoader<string, MemberType | null>(
  async (memberTypeIds: readonly string[]) => {
    const memberTypes = await prisma.memberType.findMany({
      where: {
        id: { in: Array.from(memberTypeIds) },
      },
    });
    const memberTypesMap = new Map(
      memberTypes.map((memberType) => [memberType.id, memberType]),
    );
    return memberTypeIds.map((memberTypeId) => memberTypesMap.get(memberTypeId) || null);
  },
);

export const rootDataLoader = (prisma: PrismaClient) => {
  return {
    userLoader: userLoader,
    memberTypeLoader: memberTypeLoader,
    userPostLoader: postLoader,
    userProfileLoader: profileLoader,
  };
};
