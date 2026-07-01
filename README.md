# ⚔️ BattleMon Online

> A complete full-stack web game for real-time turn-based creature battles.  
> Build your team. Enter battle. Win with strategy.

---

## 🎮 What is BattleMon Online?

BattleMon Online is a multiplayer web game where players build teams of custom creatures and battle each other in strategic turn-based combat.

The project includes user accounts, saved teams, NPC battles, real-time multiplayer battles, battle history, dark/light mode, and a full backend battle engine.

---

## ✅ Project Status

BattleMon Online is complete and ready for local testing and gameplay.

Implemented features:

- ✅ User registration and login
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Creature database
- ✅ Move system
- ✅ Team builder
- ✅ Saved teams per user
- ✅ NPC battles
- ✅ Real-time multiplayer battles with Socket.io
- ✅ Turn-based battle engine
- ✅ Damage calculation and type advantages
- ✅ Buff, heal, priority and switch mechanics
- ✅ Battle history saving
- ✅ Dark mode and light mode
- ✅ Full client-server architecture

Future improvement:

- 🔜 Add custom creature sprites and improved battle visuals

---

## 🧬 Game Basics

- 1v1 battles
- 3 creatures per team
- Turn-based combat
- Strategy based on creature stats, move choices, type advantages and switching

### Types

`Fire` · `Water` · `Grass` · `Electric` · `Earth` · `Normal`

### Stats

`HP` · `ATK` · `DEF` · `SPD`

### Battle Actions

Players can:

- Use attacking moves
- Use buff moves
- Use healing moves
- Switch active creatures
- Win by defeating the opponent's full team

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- CSS
- Axios
- Socket.io Client

### Backend

- Node.js
- Express
- Socket.io
- JWT
- bcrypt

### Database

- SQLite
- Prisma ORM

---

## 📁 Project Structure

```text
/client  → React frontend
/server  → Node.js / Express backend
/docs    → Project and design documents
```

---

## 🚀 Running the Project Locally

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Set up the database

```bash
cd server
npx prisma migrate reset
```

This resets the local SQLite database and runs the seed script.

### 3. Start the backend

```bash
cd server
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

### 4. Start the frontend

```bash
cd client
npm run dev
```

The frontend runs on the Vite local URL, usually:

```text
http://localhost:5173
```

---

## 🎯 About the Project

BattleMon Online was created as a software engineering final project. It demonstrates full-stack development, database design, REST API development, authentication, real-time communication, and complex game-state management.
