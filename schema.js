import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} from 'graphql';

import Db from './db';

const Post = new GraphQLObjectType({
  name: 'Post',
  description: 'Blog post',
  fields () {
    return {
      title: {
        type: GraphQLString,
        resolve (post) {
          return post.title;
        }
      },
      content: {
        type: GraphQLString,
        resolve (post) {
          return post.content;
        }
      },
      person: {
        type: Person,
        resolve (post) {
          return post.getPerson();
        }
      }
    };
  }
});

const Person = new GraphQLObjectType({
  name: 'Person',
  description: 'This represents a Person',
  fields: () => {
    return {
      id: {
        type: GraphQLInt,
        resolve (person) {
          return person.id;
        }
      },
      firstName: {
        type: GraphQLString,
        resolve (person) {
          return person.firstName;
        }
      },
      lastName: {
        type: GraphQLString,
        resolve (person) {
          return person.lastName;
        }
      },
      email: {
        type: GraphQLString,
        resolve (person) {
          return person.email;
        }
      },
      posts: {
        type: new GraphQLList(Post),
        resolve (person) {
          return person.getPosts();
        }
      }
    };
  }
});

const Query = new GraphQLObjectType({
  name: 'Query',
  description: 'Root query object',
  fields: () => {
    return {
      people: {
        type: new GraphQLList(Person),
        args: {
          id: {
            type: GraphQLInt
          },
          email: {
            type: GraphQLString
          }
        },
        resolve (root, args) {
          return Db.models.person.findAll({ where: args });
        }
      },
      posts: {
        type: new GraphQLList(Post),
        resolve (root, args) {
          return Db.models.post.findAll({ where: args });
        }
      }
    };
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutations',
  description: 'Functions to set stuff',
  fields () {
    return {
      addPerson: {
        type: Person,
        args: {
          firstName: {
            type: new GraphQLNonNull(GraphQLString)
          },
          lastName: {
            type: new GraphQLNonNull(GraphQLString)
          },
          email: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve (source, args) {
          return Db.models.person.create({
            firstName: args.firstName,
            lastName: args.lastName,
            email: args.email.toLowerCase()
          });
        }
      },
      addPost: {
        type: Post,
        args: {
          userId: {
            type: GraphQLNonNull(GraphQLInt)
          },
          title: {
            type: GraphQLNonNull(GraphQLString)
          },
          content: {
            type: GraphQLNonNull(GraphQLString)
          }
        },
        resolve (source, args) {
          return Db.models.user.findById(args.userId).then( user => {
            return user.createPost({
              title: args.title,
              content: args.content
            });
          });
        }
      }
    };
  }
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});

export default Schema;
