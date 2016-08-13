import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLEnumType,
} from 'graphql';
import graphqlHTTP from 'express-graphql';
import express from 'express';

import { humans, droids } from './database.js';

const episodeEnum = new GraphQLEnumType({
    name: 'EpisodeEnum',
    description: 'Relevant Star Wars episodes',
    values: {
        NEW_HOPE: {
            value: 4,
            description: 'Released in 1977'
        },
        EMPIRE: {
            value: 5,
            description: 'Released in 1980'
        },
        RETURN: {
            value: 6,
            description: 'Released in 1983'
        }
    }
});

const humanType = new GraphQLObjectType({
    name: 'HumanType',
    description: 'A humanoid creature in the Star Wars Universe',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            type: GraphQLString,
            description: 'ID of the human.'
        },
        name: {
            type: GraphQLString,
            description: 'Name of the human.'
        },
         friends: {
             type: new GraphQLList(humanType),
             description: 'Friends of the human.',
             resolve: human => human.friends
                 .map(friendId => Promise.resolve(
                     humans.find(human => human.id === friendId) ||
                     droids.find(droid => droid.id === friendId)
                 ))
         },
         appearsIn: {
             type: new GraphQLList(episodeEnum),
             description: 'Movie the human appears in.'
         },
         secretBackstory: {
             type: GraphQLString,
             description: 'Where are they from and how they came to be who they are',
             resolve: () => {
                 throw new Error('secretBackstory is secret!')
             }
         }
    })
});

const queryType = new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'Root query type',
    fields: () => ({
        human: {
            type: humanType,
            args: {
                id: {
                    description: 'id of the human',
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (root, args) => humans.find(human => human.id === args.id)
        },
        humans: {
            type: new GraphQLList(humanType),
            resolve: (root, args) => humans
        }
    })
});

export const schema = new GraphQLSchema({
    query: queryType,
    types: []
});



const allHumansQuery = `
    {
        humans {
            name
        }
    }
`;
const humanByIdQuery = (id) => `
    {
        human(id:"${id}") {
            id
            name
            appearsIn
            friends {
                id
            }
        }
    }
`;

const router = express.Router();

function graphqlRedirect(path) {
    return (req, res, next) => {
        req.url = `/graphql?query=${path}`;
        next('route');
    }
}

router.get('/humans', graphqlRedirect(allHumansQuery))
router.get('/humans/:id', (req, res, next) => {
    const { id } = req.params;
    graphqlRedirect(humanByIdQuery(id))(req, res, next);
});

express()
    .use('/', router)
    .use('/graphql', graphqlHTTP({ schema, graphiql: true }))
    .listen(5000);

console.log('GraphQL server running on http://localhost:5000/graphql');
