const express = require("express");
const http = require("http");

//
// Setup event handlers.
//
function setupHandlers(app, messageChannel) {
    app.get("/advertising", (req, res) => { // Route for streaming video.
        const randomNumber = Math.floor(Math.random() * 1) + 1;

        const forwardRequest = http.request( // Forward the request to the video storage microservice.
            {
                
                host: `metadata`,
                path: `/advertising?id=${randomNumber}`,
                method: 'GET',
                headers: req.headers,
            }, 
            forwardResponse => {
                res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
                forwardResponse.pipe(res);
            }
        );
        
        req.pipe(forwardRequest);
    });
}

//
// Start the HTTP server.
//
function startHttpServer(messageChannel) {
    return new Promise(resolve => { // Wrap in a promise so we can be notified when the server has started.
        const app = express();
        setupHandlers(app, messageChannel);

        const port = process.env.PORT && parseInt(process.env.PORT) || 3000;
        app.listen(port, () => {
            resolve(); // HTTP server is listening, resolve the promise.
        });
    });
}

//
// Application entry point.
//
function main() {
    return startHttpServer();
}

main()
    .then(() => console.log("Microservice online."))
    .catch(err => {
        console.error("Microservice failed to start.");
        console.error(err && err.stack || err);
    });