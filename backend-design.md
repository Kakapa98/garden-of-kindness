# Garden of Kindness - System Design

## 1. Architecture

The application follows a standard Client-Server architecture designed for privacy and security.

*   **Frontend**: React SPA (Single Page Application). Handles visual rendering of the garden and message decryption/viewing.
*   **Backend**: Node.js API (Express) or Serverless Functions (Firebase/AWS Lambda).
*   **Database**: PostgreSQL or MongoDB. Relational is preferred for structured integrity, but NoSQL works for document storage.

### Data Flow
1.  **Public Read**: Client requests `GET /flowers`. Server returns list of `{id, x, y, color}`. No PII (Personally Identifiable Information).
2.  **Write**: Client posts `POST /message`. Server saves data, generates `token`, returns `token`.
3.  **Private Read**: Client requests `GET /message/:token`. Server looks up message by token. If found, returns full content.

## 2. Database Schema (PostgreSQL Example)

We separate public visual data from private content data to minimize risk of accidental leaks.

```sql
-- Table: Public visuals (Safe to expose)
CREATE TABLE flowers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    x_position FLOAT NOT NULL,
    y_position FLOAT NOT NULL,
    color_hex VARCHAR(10) NOT NULL,
    visual_type INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: Private messages (Protected)
-- No foreign key dependence that exposes the relationship easily in public logs
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flower_id UUID REFERENCES flowers(id),
    access_token VARCHAR(64) UNIQUE NOT NULL, -- The secret key
    sender_name VARCHAR(100),
    recipient_name VARCHAR(100),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookup by token
CREATE INDEX idx_messages_token ON messages(access_token);
```

## 3. Backend Code Example (Node.js/Express)

```javascript
const express = require('express');
const crypto = require('crypto');
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Security Middleware
app.use(helmet());
app.use(express.json());

// Rate Limiting: Prevent enumeration and spam
const viewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per window
  message: "Too many attempts, please try again later."
});

// 1. Get Garden (Public)
app.get('/api/flowers', async (req, res) => {
  try {
    // ONLY select visual fields
    const result = await pool.query('SELECT id, x_position, y_position, color_hex, visual_type FROM flowers LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

// 2. Create Message (Secure)
app.post('/api/message', async (req, res) => {
  const { sender, recipient, content, flowerData } = req.body;
  
  // Input Validation / Sanitization would go here
  if (!content || content.length > 500) return res.status(400).json({error: "Invalid content"});

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create Flower
    const flowerRes = await client.query(
      'INSERT INTO flowers (x_position, y_position, color_hex) VALUES ($1, $2, $3) RETURNING id',
      [flowerData.x, flowerData.y, flowerData.color]
    );
    const flowerId = flowerRes.rows[0].id;

    // Generate Secure Token (High Entropy)
    const token = crypto.randomBytes(32).toString('hex');

    // Create Message
    await client.query(
      'INSERT INTO messages (flower_id, access_token, sender_name, recipient_name, content) VALUES ($1, $2, $3, $4, $5)',
      [flowerId, token, sender, recipient, content]
    );

    await client.query('COMMIT');
    
    // Return ONLY the token to the creator
    res.json({ token, flowerId });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to plant' });
  } finally {
    client.release();
  }
});

// 3. Get Private Message (Access Controlled)
app.get('/api/message/:token', viewLimiter, async (req, res) => {
  const { token } = req.params;
  
  // Basic format validation to prevent SQL injection or unnecessary db hits
  if (!/^[0-9a-f]{64}$/.test(token)) return res.status(404).json({ error: 'Not found' });

  try {
    const result = await pool.query(
      `SELECT m.sender_name, m.recipient_name, m.content, f.color_hex, f.visual_type 
       FROM messages m 
       JOIN flowers f ON m.flower_id = f.id 
       WHERE m.access_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});
```

## 4. Security Best Practices Implementation

### A. Preventing Enumeration Attacks
*   **UUIDs**: We use UUID v4 for database IDs. They are non-sequential, making it impossible to guess "the next message" by incrementing an ID.
*   **High Entropy Tokens**: The access token is a 64-character hex string (256-bit entropy). It is statistically impossible to brute-force.
*   **Generic Error Messages**: API returns `404 Not Found` for both invalid tokens and tokens that don't exist, preventing attackers from checking if a token is valid without permission.

### B. Access Control
*   **Token-Capability Model**: The bearer of the token has read access. We do not require login, reducing PII storage (emails/passwords). The security relies on the secrecy of the link.
*   **HTTPS Only**: Essential to prevent the token from being intercepted in transit.

### C. Rate Limiting & Spam
*   **Rate Limiting**: `express-rate-limit` is used on the write endpoint (planting) and the read endpoint (viewing) to prevent bot spam and brute-force scanning.
*   **Input Sanitization**: Content length limits (e.g., 500 chars) preventing buffer overflow or storage abuse.

### D. Deployment
*   **Environment Variables**: API keys and DB credentials stored in `.env`, not committed to code.
*   **CORS**: Configured to only allow requests from the specific frontend domain.
