const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());

// Helper to decode base64url/base64 to string safely
function base64Decode(str) {
    try {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
        return Buffer.from(padded, 'base64').toString('utf8');
    } catch (e) {
        return null;
    }
}

// Decode JWT payload safely
function decodeJwt(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payloadStr = base64Decode(parts[1]);
        if (!payloadStr) return null;
        return JSON.parse(payloadStr);
    } catch (e) {
        return null;
    }
}

// Helper to scan all headers for JWT-like strings
function findAndDecodeJwt(headers) {
    for (const key in headers) {
        const val = headers[key];
        if (typeof val !== 'string') continue;
        
        let token = '';
        if (val.toLowerCase().startsWith('bearer ')) {
            token = val.substring(7).trim();
        } else {
            const parts = val.split('.');
            if (parts.length === 3 && parts.every(p => /^[a-zA-Z0-9_-]+$/.test(p))) {
                token = val;
            }
        }
        
        if (token) {
            const decoded = decodeJwt(token);
            if (decoded) {
                return { headerName: key, token, payload: decoded };
            }
        }
    }
    return null;
}

// HTTP logging middleware for non-static and non-socket.io requests
app.use((req, res, next) => {
    const path = req.path;
    const isStatic = path.endsWith('.glb') || path.endsWith('.html') || path.endsWith('.js') || path.endsWith('.css') || path.startsWith('/socket.io');
    
    if (!isStatic) {
        const logData = {
            timestamp: new Date().toLocaleTimeString(),
            method: req.method,
            url: req.originalUrl || req.url,
            headers: req.headers,
            body: req.body && Object.keys(req.body).length > 0 ? req.body : null,
            jwt: findAndDecodeJwt(req.headers)
        };
        io.emit('robot:log', logData);
    }
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

const ROBOT_CAPABILITIES = {
    states: ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'],
    emotes: ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'],
    expressions: ['Angry', 'Surprised', 'Sad']
};

let currentUser = "none";

// Optional: GET capabilities
app.get('/robot/v1/capabilities', (req, res) => {
    res.json(ROBOT_CAPABILITIES);
});

// Endpoint: Get current user
app.get('/robot/v1/user', (req, res) => {
    res.json({ user: currentUser });
});

// Utility to find case-insensitive match from capabilities
function findCapability(list, target) {
    if (!target) return null;
    return list.find(item => item.toLowerCase() === target.toLowerCase());
}

// Endpoint: Set current movement state
app.post('/robot/v1/state', (req, res) => {
    const { name } = req.body;
    const exactName = findCapability(ROBOT_CAPABILITIES.states, name);
    
    if (!exactName) {
        return res.status(400).json({ 
            error: `Invalid state "${name}". Supported: ${ROBOT_CAPABILITIES.states.join(', ')}` 
        });
    }
    
    const user = req.headers['x-user'];
    if (user) {
        currentUser = user;
        io.emit('robot:user', { user: currentUser });
    }
    
    io.emit('robot:state', { name: exactName });
    res.json({ success: true, message: `State directive sent: ${exactName}` });
});

// Endpoint: Fire one-shot emote
app.post('/robot/v1/emote', (req, res) => {
    const { name } = req.body;
    const exactName = findCapability(ROBOT_CAPABILITIES.emotes, name);
    
    if (!exactName) {
        return res.status(400).json({ 
            error: `Invalid emote "${name}". Supported: ${ROBOT_CAPABILITIES.emotes.join(', ')}` 
        });
    }
    
    const user = req.headers['x-user'];
    if (user) {
        currentUser = user;
        io.emit('robot:user', { user: currentUser });
    }
    
    io.emit('robot:emote', { name: exactName });
    res.json({ success: true, message: `Emote directive sent: ${exactName}` });
});

// Endpoint: Directly update facial expression morph value
app.post('/robot/v1/expression', (req, res) => {
    const { name, value } = req.body;
    const numericVal = parseFloat(value);
    const exactName = findCapability(ROBOT_CAPABILITIES.expressions, name);
    
    if (!exactName || isNaN(numericVal)) {
        return res.status(400).json({ error: `"${name}" is invalid or values are missing. Supported: ${ROBOT_CAPABILITIES.expressions.join(', ')}` });
    }
    
    const user = req.headers['x-user'];
    if (user) {
        currentUser = user;
        io.emit('robot:user', { user: currentUser });
    }
    
    // Prevent passing raw NaN or invalid infinity to threejs uniform arrays, clamp 0-1
    const clampedVal = Math.max(0, Math.min(1, numericVal));
    
    io.emit('robot:expression', { name: exactName, value: clampedVal });
    res.json({ success: true, message: `Expression update sent: ${exactName} to ${clampedVal}` });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(` Robot API Control Server Started        `);
    console.log(` Visit http://localhost:${PORT} in browser`);
    console.log(`==========================================`);
});
