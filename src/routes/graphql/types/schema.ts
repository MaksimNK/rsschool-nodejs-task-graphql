import { GraphQLSchema } from 'graphql';

import { RootQuery } from './rootQuery.js';
import Mutations from './mutations.js';

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutations,
});

export default schema;
