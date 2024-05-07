# Task Management System

The Task Management System is a web application designed to streamline task management, providing features for user authentication, authorization, task creation, and task progress tracking. Users can create tasks, assign them to specific users, and track their progress through various stages.


![image](https://github.com/KC0149/TMS/assets/115627529/a4380007-aedf-4928-b09b-a9b44a02009f)


![image](https://github.com/KC0149/TMS/assets/115627529/805001e5-bf62-45ae-a5c0-e69e08285e8d)


![image](https://github.com/KC0149/TMS/assets/115627529/48f6919e-aabf-46e2-bc83-d7211b0544e4)


## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)

## Installation

To install and run the Task Management System locally, follow these steps:

1. Clone the backend repository to your local machine:

```

git clone https://github.com/KC0149/TMS.git
```

### Backend (Node.js)

2. Navigate to the backend directory:

```
cd backend-node.js
```

3. Install backend dependencies:

```
npm install
```

4. Set up the database:

- Use the provided database backup file (`database_backup.sql`) to create the database schema and initial data.
- You can import the SQL file into your database management system (e.g., MySQL) using tools like phpMyAdmin or MySQL Workbench.

5. Configure environment variables:

- Open the `config` folder.
- Open the `.env` file and update the database connection string and any other necessary configurations.

6. Start the backend server:

```
npm run dev
```

### Frontend

7. Navigate to the frontend directory:

```
cd frontend

```

8. Install frontend dependencies:

```
npm install
```

9. Set up environment variables or configuration files as needed (e.g., endpoint URL) in `.env` file.

10. Start the frontend development server:

```

npm run dev

```

11. Open your web browser and navigate to `http://localhost:3000` to access the Task Management System.

## Usage

Once the Task Management System is running, users can perform the following actions:

- **User Authentication**: Admin users can sign up for an account or log in with existing credentials.

  - Default Admin Account: Username: `admin`, Password: `abc123!!`. This account has administrative privileges and can create new user accounts.

- **Application Creation**: Users can create applications to group tasks and manage permissions for each application. Applications serve as containers for tasks and allow users to organize their workflow effectively.
- **Task Creation**: Users can create new tasks, specifying details such as title, description, assigned user, and due date.
- **Task Progress Tracking**: Tasks can be moved through various stages (e.g., open, todo, doing, done, closed) to track their progress.
- **Plan Creation and Selection**: Users with pm role can create and select plans for tasks, providing additional context or categorization.

## Features

- **User Authentication**: Secure user registration and login functionality.
- **Authorization**: Control access to features based on user roles and permissions.
- **Application Creation**: Create and update applications to group tasks and manage permissions.
- **Task Management**: Create, update tasks with various states.
- **Plan Creation and Selection**: Create and Assign plans to tasks for better organization.
