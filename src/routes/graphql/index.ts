import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { GraphQLSchema, graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { rootDataLoader } from './dataLoader.js';
const DEPTH_LIMIT = 5;
import schema from './types/schema.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const source = req.body.query;
      const variableValues = req.body.variables;
      const contextValue = {
        prisma: fastify.prisma,
        ...rootDataLoader(fastify.prisma),
      };
      const validateErrors = validate(schema, parse(source), [depthLimit(DEPTH_LIMIT)]);

      if (validateErrors.length) {
        return { errors: validateErrors };
      }

      const response = await graphql({
        schema,
        source,
        variableValues,
        contextValue,
      });

      return response;
    },
  });
};

export default plugin;
