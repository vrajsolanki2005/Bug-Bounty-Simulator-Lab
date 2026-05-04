const { processCommand } = require('../services/terminalService');
const jwt = require('jsonwebtoken');

const registerTerminalSocket = (io) => {
  const terminalNS = io.of('/terminal');

  terminalNS.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  terminalNS.on('connection', (socket) => {
    console.log(`[Terminal] User ${socket.user?.username} connected`);

    socket.on('command', async (command) => {
      socket.emit('output', { type: 'input', line: `$ ${command}` });

      for await (const line of processCommand(command)) {
        if (line === '__CLEAR__') {
          socket.emit('clear');
        } else {
          socket.emit('output', { type: 'text', line });
          await new Promise(r => setTimeout(r, 20)); // small delay for realism
        }
      }
      socket.emit('prompt'); // signal terminal ready for next command
    });

    socket.on('disconnect', () => {
      console.log(`[Terminal] User ${socket.user?.username} disconnected`);
    });
  });
};

module.exports = { registerTerminalSocket };
