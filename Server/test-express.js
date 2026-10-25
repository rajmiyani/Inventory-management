const express = require('express');
const app = express();
const PORT = 3005;

app.get('/', (req, res) => res.send('OK'));

const server = app.listen(PORT, () => {
    console.log('Test server running on port ' + PORT);
    process.exit(0);
});

server.on('error', (err) => {
    console.error('Test server failed:', err);
    process.exit(1);
});
