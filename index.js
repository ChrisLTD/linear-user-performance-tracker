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

async function fetchUserData(userId) {
    const query = `
        query {
            user (
                id: "${userId}",
            ) {
                name
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
    const userName = result.data.user.name;

    issues.forEach((issue) => {
        const completedWeek = moment(issue.completedAt).startOf('week').format('YYYY-MM-DD');
        const estimate = issue.estimate || 0;
        data.push({ User: userName, Week: completedWeek, Estimate: estimate });
    });
}

// Process each user's data sequentially to avoid request rate limits and avoid mixing up console output.
async function processUsersSequentially(userIds) {
    for (const userId of userIds) {
        await fetchUserData(userId);
    }

    // Create an object that is first grouped by Week, then User, summing the Estimates
    const groupedData = data.reduce((acc, row) => {
        const { Week, User, Estimate } = row;
        if (!acc[Week]) {
            acc[Week] = {};
        }
        if (!acc[Week][User]) {
            acc[Week][User] = Estimate;
        } else {
            acc[Week][User] += Estimate;
        }
        return acc;
    }, {});

    // Convert this object to an array of objects, suitable for console.table
    let tableData = Object.entries(groupedData).map(([Week, userEstimates]) => {
        const weekRow = { Week };
        Object.entries(userEstimates).forEach(([User, Estimate]) => {
            weekRow[User] = Estimate;
        });
        return weekRow;
    });

    // Sort the tableData array by Week in descending order
    tableData = tableData.sort((a, b) => moment(b.Week).valueOf() - moment(a.Week).valueOf());

    console.table(tableData);
}

processUsersSequentially(userIds);