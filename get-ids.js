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

async function listTeamsAndUsers() {
    const teamsQuery = `
        query {
            teams {
                nodes {
                    id
                    name
                }
            }
        }
    `;

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

    const teams = await fetchFromLinear(teamsQuery);
    const users = await fetchFromLinear(usersQuery);

    console.log("Teams:");
    teams.teams.nodes.forEach(team => console.log(`ID: ${team.id}, Name: ${team.name}`));

    console.log("\nUsers:");
    users.users.nodes.forEach(user => console.log(`ID: ${user.id}, Name: ${user.name}`));
}

listTeamsAndUsers();
