const app = require("./app");
const http = require("http");
const server = http.createServer(app);
const socketHandler = require("./socket/Socket");

const PORT = process.env.PORT;

const io = socketHandler(server);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
