require('dotenv').config();

const fetch = require('node-fetch');
const moment = require('moment');

const apiKey = process.env.API_KEY;
const userIds = process.env.USER_IDS.split(','); // This will convert the comma-separated string into an array

let data = [];

const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + apiKey,
};

const date90daysAgo = new Date();
date90daysAgo.setDate(date90daysAgo.getDate() - 90);
const isoDate90daysAgo = date90daysAgo.toISOString();

userIds.forEach(async (userId) => {
    const query = `
        query {
            user (
                id: "${userId}",
            ) {
                assignedIssues(
                    filter: {
                        completedAt: {gt: "${isoDate90daysAgo}"},
                        estimate: {gt: 0}
                    },
                    first: 100,
                    includeArchived: true,
                    orderBy: updatedAt
                ) {
                    nodes {
                        id
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

    if (result.errors) {
        console.error(`Errors returned from the API: ${result.errors.map(e => e.message).join(', ')}`);
        return;
    }

    if (!result.data.user) {
        console.error(`No user data found. Check if provided user ID is correct.`);
        return;
    }

    const issues = result.data.user.assignedIssues.nodes;

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
