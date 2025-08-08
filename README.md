# Campus Confessions Backend

A full-stack anonymous campus confession board application backend built with Node.js, Express, Socket.IO, and MySQL using Prisma ORM.

## 🚀 Features

- **Anonymous Confessions**: Post confessions anonymously with college filtering
- **Real-time Updates**: Socket.IO for live confession and reaction updates
- **Reaction System**: React with 🔥 ❤️ 💀 😭 emojis
- **Moderation**: Report system for inappropriate content
- **Instagram Integration**: Auto-post confessions with 50+ reactions to Instagram
- **RESTful API**: Complete REST API with validation and error handling
- **WebSocket Support**: Real-time communication between clients and server

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campus-confessions-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/campus_confessions"
   PORT=3001
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   
   # Seed the database with sample data
   npm run prisma:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

### Confession Model
```sql
- id: Int (Primary Key)
- content: Text (Confession text)
- createdAt: DateTime
- college: String? (Optional college filter)
- isFlagged: Boolean (For moderation)
- fire: Int (🔥 reactions)
- heart: Int (❤️ reactions)
- skull: Int (💀 reactions)
- cry: Int (😭 reactions)
```

### Report Model
```sql
- id: Int (Primary Key)
- confessionId: Int (Foreign Key)
- reason: Text (Report reason)
- reportedAt: DateTime
```

## 🔌 API Endpoints

### Confessions

#### `POST /api/confessions`
Create a new anonymous confession.

**Request Body:**
```json
{
  "content": "Your confession text here...",
  "college": "MIT" // Optional
}
```

**Response:**
```json
{
  "message": "Confession created successfully",
  "confession": {
    "id": 1,
    "content": "Your confession text here...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "college": "MIT",
    "reactions": {
      "fire": 0,
      "heart": 0,
      "skull": 0,
      "cry": 0
    }
  }
}
```

#### `GET /api/confessions`
Fetch confessions with optional filtering and pagination.

**Query Parameters:**
- `college`: Filter by college name
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "confessions": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 100,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### `POST /api/confessions/:id/react`
React to a confession.

**Request Body:**
```json
{
  "reactionType": "fire" // "fire", "heart", "skull", "cry"
}
```

#### `GET /api/confessions/:id`
Get a specific confession by ID.

### Reports

#### `POST /api/reports`
Report a confession for moderation.

**Request Body:**
```json
{
  "confessionId": 1,
  "reason": "Inappropriate content"
}
```

#### `GET /api/reports`
Get all reports (admin/moderator endpoint).

#### `GET /api/reports/confession/:id`
Get all reports for a specific confession.

#### `DELETE /api/reports/:id`
Delete a report (admin/moderator endpoint).

## 🔌 WebSocket Events

### Client to Server Events

- `join_room`: Join a college-specific room
- `leave_room`: Leave a college-specific room
- `get_stats`: Request current statistics
- `get_recent_confessions`: Request recent confessions
- `get_trending_confessions`: Request trending confessions
- `typing_start`: Start typing indicator
- `typing_stop`: Stop typing indicator
- `get_online_users`: Request online users count
- `ping`: Health check

### Server to Client Events

- `welcome`: Welcome message on connection
- `room_joined`: Confirmation of joining a room
- `room_left`: Confirmation of leaving a room
- `stats_update`: Updated statistics
- `recent_confessions`: Recent confessions data
- `trending_confessions`: Trending confessions data
- `new_confession`: New confession broadcast
- `confession_reacted`: Reaction update broadcast
- `user_typing`: User typing indicator
- `user_stopped_typing`: User stopped typing indicator
- `online_users`: Online users count
- `pong`: Health check response
- `error`: Error messages

## 📸 Instagram Integration

The backend automatically posts confessions to Instagram when they reach 50+ total reactions.

### Integration Methods

1. **Meta Instagram Graph API** (Direct integration)
   - Set `INSTAGRAM_ACCESS_TOKEN` and `INSTAGRAM_BUSINESS_ACCOUNT_ID`
   - Requires Instagram Business Account

2. **Webhook Integration** (Zapier/Make)
   - Set `INSTAGRAM_WEBHOOK_URL`
   - Send data to external automation service

3. **Mock Function** (Development/Testing)
   - Default fallback for testing
   - Logs the post details to console

### Instagram Post Format

```
🔥 HOT CONFESSION 🔥

"Confession content here..."

📍 College Name

💥 75 reactions
🔥 25 | ❤️ 30 | 💀 10 | 😭 10

#CampusConfessions #StudentLife #Anonymous #Confessions
```

## 🛡️ Security Features

- **CORS Protection**: Configured for frontend domains
- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Joi validation for all endpoints
- **Error Handling**: Comprehensive error handling and logging
- **Helmet**: Security headers middleware
- **Content Moderation**: Report system with automatic flagging

## 📁 Project Structure

```
campus-confessions-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js               # Database seeding
├── routes/
│   ├── confessions.js        # Confession routes
│   └── reports.js           # Report routes
├── socket/
│   └── socketHandler.js      # Socket.IO event handlers
├── services/
│   └── instagramService.js   # Instagram integration
├── server.js                 # Main server file
├── package.json             # Dependencies and scripts
├── env.example             # Environment variables template
└── README.md               # This file
```

## 🚀 Scripts

```bash
# Development
npm run dev                 # Start development server with nodemon

# Production
npm start                   # Start production server

# Database
npm run prisma:generate     # Generate Prisma client
npm run prisma:migrate      # Run database migrations
npm run prisma:studio       # Open Prisma Studio
npm run prisma:seed         # Seed database with sample data
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | Required |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `INSTAGRAM_ACCESS_TOKEN` | Meta API access token | Optional |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Instagram business account ID | Optional |
| `INSTAGRAM_WEBHOOK_URL` | Webhook URL for Instagram posting | Optional |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

### Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP address
- Configurable via environment variables

## 🧪 Testing

### Manual Testing

1. **Health Check**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Create Confession**
   ```bash
   curl -X POST http://localhost:3001/api/confessions \
     -H "Content-Type: application/json" \
     -d '{"content": "Test confession", "college": "MIT"}'
   ```

3. **Get Confessions**
   ```bash
   curl http://localhost:3001/api/confessions
   ```

4. **React to Confession**
   ```bash
   curl -X POST http://localhost:3001/api/confessions/1/react \
     -H "Content-Type: application/json" \
     -d '{"reactionType": "fire"}'
   ```

### WebSocket Testing

Use a WebSocket client (like wscat) to test real-time features:

```bash
# Install wscat
npm install -g wscat

# Connect to server
wscat -c ws://localhost:3001

# Send events
{"event": "get_stats"}
{"event": "join_room", "data": {"roomName": "MIT"}}
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check `DATABASE_URL` in `.env`
   - Run `npm run prisma:generate`

2. **Port Already in Use**
   - Change `PORT` in `.env`
   - Kill existing process: `lsof -ti:3001 | xargs kill`

3. **CORS Errors**
   - Update CORS origins in `server.js`
   - Check frontend URL configuration

4. **Instagram Integration Not Working**
   - Check environment variables
   - Verify API credentials
   - Check webhook URL configuration

## 📈 Monitoring

The server provides several monitoring endpoints:

- `/health`: Server health check
- Socket.IO connection tracking
- Request/response logging
- Error tracking and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for the campus community** 