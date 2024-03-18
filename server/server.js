require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const pool = require('./db');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const jwtSecret = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[1];
        req.token = bearerToken;
        jwt.verify(req.token, jwtSecret, (err, authData) => {
            if (err) {
                console.log('Token verification failed:', err.message);
                res.sendStatus(403);
            } else {
                console.log('Token verified, user:', authData);
                req.user = authData;
                next();
            }
        });
    } else {
        res.sendStatus(401);
    }
};

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
        return res.status(409).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
            [username, hashedPassword]
        );

        const token = jwt.sign({ userId: newUser.rows[0].id }, jwtSecret, { expiresIn: '1h' });

        res.status(201).json({ token, userId: newUser.rows[0].id });
    } catch (error) {
        console.error('Error creating new user:', error.message);
        res.status(500).send('Server error');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = userQuery.rows[0];
        if (user && bcrypt.compareSync(password, user.password)) {
            jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' }, (err, token) => {
                res.json({ token, userId: user.id });
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.use('/chat', verifyToken);

app.get('/users', async (req, res) => {
    try {
        const allUsers = await pool.query('SELECT id, username FROM users');
        res.json(allUsers.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userQuery = await pool.query('SELECT id, username FROM users WHERE id = $1', [userId]);
        if (userQuery.rows.length > 0) {
            res.json(userQuery.rows[0]);
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/chat/:userId/:contactId', async (req, res) => {
    const { userId, contactId } = req.params;
    const { startDate, endDate } = req.query;

    let query = `
        SELECT * FROM messages
        WHERE ((user_id = $1 AND receiver_id = $2) OR (user_id = $2 AND receiver_id = $1))
    `;
    const queryParams = [userId, contactId];

    if (startDate) {
        query += ` AND created_at >= $${queryParams.length + 1}`;
        queryParams.push(startDate);
    }

    if (endDate) {
        query += ` AND created_at <= $${queryParams.length + 1}`;
        queryParams.push(endDate);
    }

    query += ` ORDER BY created_at ASC`;

    try {
        const chatHistory = await pool.query(query, queryParams);
        console.log(chatHistory.rows);
        res.json(chatHistory.rows);
    } catch (err) {
        console.error("Error fetching chat history:", err.message);
        res.status(500).send("Server error");
    }
});


app.patch('/messages/:messageId', async (req, res) => {
});

app.delete('/messages/:messageId', async (req, res) => {
});

io.on('connection', (socket) => {

    socket.on('editMessage', async (data) => {
        try {
            const { id, content } = data;
            const updatedMessage = await pool.query(
                'UPDATE messages SET content = $1 WHERE id = $2 RETURNING *',
                [content, id]
            );
            io.emit('messageEdited', updatedMessage.rows[0]);
        } catch (err) {
            console.error("Error editing message:", err.message);
        }
    });

    socket.on('deleteMessage', async (messageId) => {
        try {
            await pool.query('DELETE FROM messages WHERE id = $1', [messageId]);
            io.emit('messageDeleted', messageId);
        } catch (err) {
            console.error("Error deleting message:", err.message);
        }
    });
});

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    socket.on('joinRoom', ({ userId }) => {
        if (userId) {
            socket.join(userId.toString());
        } else {
            console.error('joinRoom: userId is null');
        }
    });


    socket.on('sendMessage', async (messageData) => {
        try {
            const result = await pool.query(
                'INSERT INTO messages (user_id, receiver_id, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
                [messageData.senderId, messageData.receiverId, messageData.content]
            );

            const savedMessage = result.rows[0];
            savedMessage.tempId = messageData.tempId;

            io.to(messageData.senderId.toString()).emit('receiveMessage', {
                ...savedMessage,
                senderId: messageData.senderId
            });

            io.to(messageData.receiverId.toString()).emit('receiveMessage', {
                ...savedMessage,
                senderId: messageData.senderId
            });
        } catch (err) {
            console.error("Error saving message:", err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

});

server.listen(5000, () => {
    console.log('Server is running on port 5000');
});
