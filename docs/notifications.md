# SkillBridge — Notification System Documentation (Phase 7)

## 1. Overview
The Notification System provides real-time in-app alerts and transactional email foundations for SkillBridge. It keeps candidates and recruiters synchronized when key recruitment actions occur (such as job applications, recruitment status updates, and application withdrawals).

---

## 2. Notification Architecture

```
                    APPLICATION EVENT
                           │
             ┌─────────────┴─────────────┐
             │                           │
        DATABASE                    NOTIFICATION
             │                           │
       Application                 Notification
       Updated/Created             Created
             │                           │
             │                ┌──────────┴──────────┐
             │                │                     │
             │              IN-APP                EMAIL
             │                │
             │             Socket.IO
             │                │
             │                ▼
             │           🔔 User Bell
             │                │
             │                ▼
             │        Notification Center
             │
             ▼
        Application
        remains source
        of truth
```

### PostgreSQL Source of Truth
PostgreSQL is the single authoritative source of truth. Socket.IO acts as an ephemeral real-time delivery layer. If a user is offline when an event occurs, the notification is safely persisted in PostgreSQL and retrieved via REST APIs (`GET /api/notifications`) when the user logs in.

---

## 3. Notification Types

```typescript
export type NotificationType =
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_REVIEWING'
  | 'APPLICATION_SHORTLISTED'
  | 'APPLICATION_INTERVIEW'
  | 'APPLICATION_SELECTED'
  | 'APPLICATION_REJECTED'
  | 'APPLICATION_WITHDRAWN'
  | 'JOB_PUBLISHED'
  | 'PROFILE_UPDATE'
  | 'SYSTEM';
```

---

## 4. API Endpoints

All notification endpoints require authentication via JWT (`Authorization: Bearer <token>`).

- `GET /api/notifications`
  - **Query Params**: `read` (`true` | `false`), `type` (`NotificationType`), `page` (default 1), `limit` (default 20, max 50).
  - **Response**: Paginated user notifications.

- `GET /api/notifications/unread-count`
  - **Response**: `{ "success": true, "data": { "count": 5 } }`

- `PATCH /api/notifications/:notificationId/read`
  - **Ownership Check**: Verifies notification belongs to `req.user.id`.
  - **Action**: Sets `is_read = true` and `read_at = CURRENT_TIMESTAMP`.

- `PATCH /api/notifications/read-all`
  - **Action**: Marks all unread notifications belonging to `req.user.id` as read.

- `DELETE /api/notifications/:notificationId`
  - **Ownership Check**: Only deletes notification if `user_id = req.user.id`. Returns `404` if not found or unauthorized.

- `DELETE /api/notifications/read`
  - **Action**: Deletes all read notifications belonging to `req.user.id`.

---

## 5. Socket.IO Real-Time Engine

### Authentication Handshake
Sockets are authenticated using the user's JWT access token passed via `socket.handshake.auth.token`.

### Private Room Isolation
Upon successful JWT verification, the socket automatically joins a private user room:
`user:${authenticatedUserId}`

Notifications for User A are emitted ONLY to room `user:${authenticatedUserId}`:
```typescript
io.to(`user:${userId}`).emit('notification:new', notificationPayload);
```

---

## 6. Email System Integration
- `EmailService` provides provider abstractions for transactional notification emails (`sendApplicationSubmittedEmail`, `sendApplicationStatusEmail`).
- Email dispatch runs asynchronously and non-blockingly so external mail failures never compromise application updates or database transactions.

---

## 7. Security & IDOR Prevention
1. **No User ID Spoofing**: Notification queries and updates strictly use `req.user.id` extracted from JWT.
2. **Private Rooms**: Socket clients cannot request to join arbitrary user rooms. Rooms are assigned strictly by backend authentication.
3. **Target Authorization**: Navigating from a notification to `/applications/:id` still requires full application authorization checks at the target API level.
