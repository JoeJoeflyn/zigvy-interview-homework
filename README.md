# Zigtask

## Project Overview

Zigtask is a Kanban-style task management app that helps users track their work using three columns: To Do, In Progress, and Completed. Users can easily drag and drop task cards between columns, as well as filter tasks by keyword or due date.

## Features

- User authentication (JWT-based)
- Task management (CRUD operations)
- RESTful API architecture
- Prisma ORM for database operations
- Drag and drop functionality for task reordering
- Filtering tasks by keyword or due date

## Tech Stack

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL (with Prisma ORM)
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI
- **Package Manager**: pnpm
- **Containerization**: Docker

### Frontend (To be implemented)
- **Framework**: React + TypeScript + Vite + React Router + React Query
- **State Management**: Zustand
- **UI Library**: Shadcn, TailwindCSS
- **Package Manager**: pnpm

## Setup & Run Instructions

### Prerequisites
- pnpm
- Docker

## Development

### Linting
```bash
pnpm lint
```

### Formatting
```bash
pnpm format
```

### Building for Production
```bash
pnpm build
```

### Backend Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the `zigtask-api` directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=5100

   JWT_SECRET=your-secret
   JWT_EXPIRES_IN=1d
   JWT_REFRESH_EXPIRES_IN=7d

   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fake-db?schema=public"
   ```

3. **Run database migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Set up Docker**
   ```bash
   # Start the Docker for database
   docker compose up -d
   ```

5. **Start the development server**
   ```bash
   # Development mode
   pnpm run dev

   # Production mode
   pnpm run build
   pnpm run start:prod
   ```

6. **Access API documentation**
   Once the server is running, access the Swagger documentation at:
   ```
   http://localhost:5100/api
   ```

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd ../zigtask-web
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   # Development mode
   pnpm run dev

   # Build for production
   pnpm run build
   ```

4. **Access the application**
   Once the development server is running, access the application at:
   ```
   http://localhost:5173
   ```

## API Documentation

Detailed API documentation is available through Swagger UI when the application is running:
- Development: `http://localhost:5100/api`

The API follows RESTful principles and includes the following endpoints:

### User
- `GET /user/me` - Get the current user's information

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate and receive JWT token
- `POST /auth/refresh` - Exchange a refresh token for a new access token

### Tasks
- `GET /tasks` - Get all tasks (requires authentication)
- `POST /tasks` - Create a new task
- `GET /tasks/:id` - Get a specific task
- `PATCH /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

## Demo

### Dashboard page
![alt text](./public/image.png)

### Login page
![alt text](./public/image-1.png)

### Register page
![alt text](./public/image-2.png)