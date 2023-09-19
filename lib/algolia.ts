import algoliasearch from 'algoliasearch';

const client = algoliasearch('8W3ZG1OHSP', process.env.ALGOLIA as string);
const index = client.initIndex('users');
export {index};
