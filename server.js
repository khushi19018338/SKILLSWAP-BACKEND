require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const supabase = require('./config/supabase');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for dev/testing
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Main Route Check
app.get('/', (req, res) => {
  res.json({ message: 'SkillSwap Backend API is running successfully!' });
});

// Import API Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);

// Socket.io Real-time connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('joinSessionChat', ({ sessionId }) => {
    socket.join(`session_${sessionId}`);
    console.log(`Socket ${socket.id} joined chat for session: ${sessionId}`);
  });

  socket.on('sendMessage', async ({ sessionId, senderId, content }) => {
    const payload = {
      session_id: sessionId,
      sender_id: senderId,
      content,
      created_at: new Date()
    };

    // Broadcast to the specific session room
    io.to(`session_${sessionId}`).emit('receiveMessage', payload);

    // Persist message asynchronously to Supabase
    // Persist message asynchronously to Supabase only if it's a valid UUID
    try {
      const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      
      if (isUUID(sessionId) && isUUID(senderId)) {
        const { error } = await supabase.from('messages').insert([{
          session_id: sessionId,
          sender_id: senderId,
          content
        }]);
        if (error) console.error("Error saving message:", error.message);
      }
    } catch (err) {
      console.error("Exception saving message:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend Server running locally on port ${PORT}`);
});
