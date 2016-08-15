import fetch from 'node-fetch';

const graphqlEndpointWithId = 'http://localhost:5000/graphql?query={human(id:"1001"){name}}';
fetch(graphqlEndpointWithId)
    .then(res => res.json())
    .then(human => console.log('\nGraphQL[id]:', human));

const restEndpointWithId = 'http://localhost:5000/humans/1002';
fetch(restEndpointWithId)
    .then(res => res.json())
    .then(human => console.log('\nREST[id]:', human));

const graphqlEndpoint = 'http://localhost:5000/graphql?query={humans{name}}';
fetch(graphqlEndpoint)
    .then(res => res.json())
    .then(humans => console.log('\nGraphQL:', humans));

const restEndpoint = 'http://localhost:5000/humans';
fetch(restEndpoint)
    .then(res => res.json())
    .then(humans => console.log('\nREST:', humans));
