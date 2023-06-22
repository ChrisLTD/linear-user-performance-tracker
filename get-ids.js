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

    // Sort teams and users by name
    teams.teams.nodes.sort((a, b) => a.name.localeCompare(b.name));
    users.users.nodes.sort((a, b) => a.name.localeCompare(b.name));

    // Find the longest name in teams and users
    const allNames = [...teams.teams.nodes.map(n => n.name), ...users.users.nodes.map(n => n.name)];
    const longestNameLength = allNames.reduce((max, name) => Math.max(max, name.length), 0);

    console.log("Teams:");
    teams.teams.nodes.forEach(team => console.log(`${team.name.padEnd(longestNameLength)} id: ${team.id}`));

    console.log("\nUsers:");
    users.users.nodes.forEach(user => console.log(`${user.name.padEnd(longestNameLength)} id: ${user.id}`));
}

listTeamsAndUsers();
