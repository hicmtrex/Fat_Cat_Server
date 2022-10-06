"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("./utils/config/config"));
const db_1 = __importDefault(require("./utils/db"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./middleware/logger");
const error_1 = require("./middleware/error");
const auth_1 = __importDefault(require("./routes/auth"));
const message_1 = __importDefault(require("./routes/message"));
const chat_1 = __importDefault(require("./routes/chat"));
const user_1 = __importDefault(require("./routes/user"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
//access .env file
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '/.env'),
});
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
(0, db_1.default)();
//enable middlewares
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: [config_1.default.FRONT_URL],
    credentials: true,
}));
if (config_1.default.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
//routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', user_1.default);
app.use('/api/message', message_1.default);
app.use('/api/chat', chat_1.default);
// default view templet
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'views', 'index.html'));
});
// default error templet
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path_1.default.join(__dirname, 'views', '404.html'));
    }
    else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' });
    }
    else {
        res.type('txt').send('404 Not Found');
    }
});
//costom middlewares
app.use(logger_1.logger);
app.use(error_1.errorHandler);
const PORT = config_1.default.PORT || 5000;
// running the express server success
mongoose_1.default.connection.once('open', () => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => console.log(`🟢 Server running in ${config_1.default.NODE_ENV} mode on port ${PORT}`));
});
// running the express server fail
mongoose_1.default.connection.on('error', (err) => {
    console.log(err);
    (0, logger_1.logEvents)(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
});
const io = new socket_io_1.Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: [config_1.default.FRONT_URL],
        credentials: true,
    },
});
//realtime data with socket io
io.on('connection', (socket) => {
    console.log('🟢 Connected to socket.io');
    //join room
    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit('🟢 connected');
    });
    //join chat
    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('👤 User Joined Room: ' + room);
    });
    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));
    //send new message
    socket.on('new message', (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
        if (!chat.users)
            return console.log('chat.users not defined');
        chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id)
                return;
            // recived message
            socket.in(user._id).emit('message recieved', newMessageRecieved);
        });
    });
    socket.off('setup', (userData) => {
        console.log('🔴 USER DISCONNECTED');
        socket.leave(userData._id);
    });
});
