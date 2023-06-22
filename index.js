require('dotenv').config();

const fetch = require('node-fetch');
const moment = require('moment');

const apiKey = process.env.API_KEY;
const teamId = process.env.TEAM_ID;
const userIds = process.env.USER_IDS.split(','); // This will convert the comma-separated string into an array

let data = [];

const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + apiKey,
};

userIds.forEach(async (userId) => {
    const query = `
        query {
            user (id: "${userId}") {
                issues(states: [Completed], teamId: "${teamId}") {
                    nodes {
                        title
                        completedAt
                        estimate
                    }
                }
            }
        }
    `;

    const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ query: query }),
    });

    const result = await response.json();

    const issues = result.data.user.issues.nodes;

    issues.forEach((issue) => {
        const completedWeek = moment(issue.completedAt).format('YYYY-WW');
        const estimate = issue.estimate || 0;
        data.push({ User: userId, Week: completedWeek, Estimate: estimate });
    });

    // Print data grouped by User and Week, summing the Estimates
    const groupedData = data.reduce((acc, row) => {
        const key = `${row.User}-${row.Week}`;
        if (!acc[key]) {
            acc[key] = { ...row };
        } else {
            acc[key].Estimate += row.Estimate;
        }
        return acc;
    }, {});

    console.table(Object.values(groupedData));
});
