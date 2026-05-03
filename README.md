# Team Task Manager

A full-stack team task management application with role-based access control.

## Features

- **Authentication**: JWT-based signup/login with bcrypt password hashing
- **Role-Based Access Control**: Admin and Member roles with different permissions
- **Project Management**: Create, update, delete projects with team members
- **Task Management**: Full CRUD for tasks with status tracking
- **Dashboard**: Overview with statistics, charts, and task summaries
- **Responsive UI**: Clean, modern interface with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Auth**: JWT tokens, bcrypt

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup Instructions

### 1. Clone and Install

```bash
# Clone the repository
git clone <repo-url>
cd team-task-manager

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
