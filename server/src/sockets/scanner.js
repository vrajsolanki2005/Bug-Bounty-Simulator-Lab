const jwt = require('jsonwebtoken');

const registerScannerSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // User joins their personal scan room
    socket.on('join_scan', ({ scan_id }) => {
      const room = `scan_${socket.user.id}_${scan_id}`;
      socket.join(room);
      socket.emit('joined', { room, scan_id });
    });

    socket.on('leave_scan', ({ scan_id }) => {
      socket.leave(`scan_${socket.user.id}_${scan_id}`);
    });
  });
};

module.exports = { registerScannerSocket };
