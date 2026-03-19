# 🚀 Employee Management System (EMS)

A full-stack Employee Management System built using React, Node.js/Express, and MariaDB.
It provides separate dashboards for Admin and Employee with features like authentication, attendance, and leave management.

🛠️ TECH STACK

Frontend: React (Vite), Context API

Backend: Node.js, Express

Database: MariaDB (HeidiSQL)

Auth: JWT, bcryptjs

✨ FEATURES 

Admin

* Dashboard with key stats

* View/manage employees

* Monitor attendance

* Approve/reject leave requests

Employee

* Dashboard with personal stats

* Check-in / Check-out attendance

* Apply for leave & track status

* View assigned tasks

📁 Project Structure

      EMS/
      ├── ems-client/   # React frontend
      ├── ems-server/   # Backend (Node + Express)

⚡ Setup

    git clone https://github.com/dev-rishitha/EMS.git
    cd EMS

 Backend
 
    cd ems-server
    npm install
    npm start

Frontend

    cd ems-client
    npm install
    npm run dev     

🌟 Future Improvements

* Fully dynamic CRUD for employees and tasks from the UI.

* More detailed attendance analytics and reports.

* Role-based permissions for additional roles (HR, manager).
