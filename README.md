# 🗳️ Polling Booth — Full Stack Voting Platform (MERN)

**Polling Booth** is a full-stack web application built using the **MERN stack (MongoDB, Express.js, React.js, Node.js)**. It allows users to create, vote, comment, and like polls in various categories such as Technology, Sports, Entertainment, and more.

🌐 **Live Demo:** [react.krishethaa.online] (http://react.krishethaa.online)
---

## 🚀 Features

- 🔐 **Full JWT Authentication**: JWT protection for all APIs including poll operations, comments, likes, and votes.
- ✅ **Create and manage polls** with category filters.
- 🗳️ **Vote on polls** with real-time count updates.
- ❤️ **Like / Unlike polls**, with restrictions on closed polls.
- 💬 **Recursive comments and threaded replies** (nested commenting supported).
- 🖼️ **Profile image upload** for users.
- 📊 **Auto-closing of expired polls**.
- 🔍 **Search and filter polls** by category or question.
- 🌗 **View open / closed polls** with toggle.
- ☁ **Fully deployed on AWS (Frontend + Backend)**

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Axios, Bootstrap, React Icons  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB, Mongoose  
- **Authentication:** JSON Web Tokens (JWT)  
- **Other:** Multer (for image uploads), Nodemon (for dev server)

---

## 📁 Folder Structure
Polling-Booth-Full-Stack-Voting-Platform-MERN/
├── poll-booth-frontend/ # React frontend
└── poll-booth/ # Node + Express backend

---

## ⚡ Setup Instructions

1️⃣ **Clone the repository**
git clone https://github.com/Krishethaa/Polling-Booth-Full-Stack-Voting-Platform-MERN.git
cd Polling-Booth-Full-Stack-Voting-Platform-MERN

2️⃣ Install dependencies
# Backend
cd poll-booth
npm install

# Frontend
cd ../poll-booth-frontend
npm install

3️⃣ Run the application
# Backend
cd poll-booth
npm run server  # or nodemon index.js

# Frontend (in a separate terminal)
cd ../poll-booth-frontend
npm start

🌐 Deployed Application
✅ Access the app at: http://react.krishethaa.online

The frontend and backend are hosted on AWS. The React frontend is connected to the live backend server seamlessly.

🤝 Contribution
Contributions are welcome!
➡ Fork → Create branch → Commit changes → Open pull request

📄 License
This project is licensed under the MIT License.

