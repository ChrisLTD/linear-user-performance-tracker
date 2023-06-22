# Linear User Performance Tracker

This project fetches issue estimates completed by users in a team from the Linear API.

## Prerequisites

Before you begin, ensure you have met the following requirements:

* You have a recent version of Node.js installed (version 14.0.0 or later is recommended).
* You have an API key from Linear.

## Setup


Next, install the project's dependencies:

```
npm install
```

Create a new file in the project's root directory named .env and add your Linear API key:

```
API_KEY=your-api-key
```

Replace 'your-api-key' with your actual value.

## Fetching Team and User IDs

You can fetch your user IDs by running the `get-ids.js` script. Use the following command:

```
npm run get-ids
```

This will print a list of your teams and users along with their IDs.

Add your chosen user IDs (separated by commas without spaces) to the .env file:

```
USER_IDS=user-id-1,user-id-2,user-id-3
```

Replace 'user-id-1,user-id-2,user-id-3' with your actual values.

## Running the Project

To run the project, use the following command:
```
npm start
```

This will fetch the data from the Linear API and print it to the console.