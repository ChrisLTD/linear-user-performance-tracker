require('dotenv').config();

const fetch = require('node-fetch');

const apiKey = process.env.API_KEY;

const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + apiKey,
};

async function fetchFromLinear(query) {
    const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ query: query }),
    });

    const json = await response.json();
    return json.data;
}

async function listUsers() {
    const usersQuery = `
        query {
            users {
                nodes {
                    id
                    name
                }
            }
        }
    `;

    const users = await fetchFromLinear(usersQuery);

    // Sort teams and users by name
    users.users.nodes.sort((a, b) => a.name.localeCompare(b.name));

    // Find the longest name
    const allNames = [...users.users.nodes.map(n => n.name)];
    const longestNameLength = allNames.reduce((max, name) => Math.max(max, name.length), 0);

    console.log("\nUsers:");
    users.users.nodes.forEach(user => console.log(`${user.name.padEnd(longestNameLength)} id: ${user.id}`));
}

listUsers();
