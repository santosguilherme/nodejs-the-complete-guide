const fs = require('fs');

const requestHandler = (request, response) => {
    const {url, method} = request;

    if (url === "/") {
        response.setHeader("Content-Type", "text/html");

        response.write(`
            <html>
                <head><title>Enter a message</title></head>
                <body>
                    <form action="/message" method="POST">
                        <input type="text" name="message" placeholder="Message">
                        <button type="submit">Send</button>
                    </form>
                </body>
            </html>
        `);

        return response.end();
    }

    if (url === '/message' && method === 'POST') {
        const requestBody = [];
        request.on('data', (chunk) => {
            requestBody.push(chunk);
        });

        return request.on('end', () => {
            const parsedRequestBody = Buffer.concat(requestBody).toString();
            const message = parsedRequestBody.split('=')[1];

            fs.writeFile("message.txt", message, (error) => {
                response.statusCode = 302;
                response.setHeader('Location', '/');

                return response.end();
            });
        });
    }

    response.setHeader("Content-Type", "text/html");

    response.write(`
        <html>
            <head><title>My First Page!</title></head>
            <body><h1>Hello from my Node.js server!</h1></body>
        </html>
    `);

    response.end();
};

module.exports = requestHandler;
