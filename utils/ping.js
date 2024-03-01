const axios = require('axios');

function pingServer() {
	const endpoint = 'https://certify-u01m.onrender.com/api/ping';

	axios
		.get(endpoint)
		.then((response) => {
			console.log(`Server pinged successfully at ${new Date()}`);
			// Process the response as needed
		})
		.catch((error) => {
			console.error(`Error pinging the server: ${error.message}`);
		});
}

module.exports = pingServer;
