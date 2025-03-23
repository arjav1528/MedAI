# README

# 🏥 **MedAI: Patient-Clinician Portal for Connected Care and Healthy Aging**

## 📌 **Project Overview**

**Description:**

**MedAI** is an AI-powered healthcare portal designed to enhance accessibility for elderly individuals. It enables patients to submit health-related queries and receive AI-assisted responses while incorporating emergency features such as live location tracking and an SOS button.

### **Key Features:**

- **AI-Assisted Health Query Responses**
- **Secure Google OAuth Authentication**
- **Emergency SOS Alerts with Live Location**
- **Voice-to-Text Input for Accessibility**
- **User-Friendly UI Optimized for Seniors**

---

## 📖 **Table of Contents**

1. Project Overview
2. Installation
3. Usage
4. Features
5. Project Architecture
6. Contributing
7. Credits & Acknowledgment

---

## ⚙️ **Installation**

To set up the project locally, follow these steps:

### **Prerequisites:**

- **Node.js v16+**
- **MongoDB** (Cloud)
- **Vercel CLI** (Optional, for deployment)
- **Python3.13**

### **Steps:**

1️⃣ **Clone the repository:**

```bash
git clone https://github.com/your-repo/med-ai.git
cd med-ai
```

2️⃣ **Install dependencies:**

```bash

npm install
```

3️⃣ **Run the project:**

```bash

npm run dev
```

4️⃣ **Environment Variables:**

Create a `.env.local` file and add:

```
MONGODB_URI=<your-mongodb-connection-string>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
NEXTAUTH_SECRET=<your-random-secret>
GOOGLE_API_KEY=<your-google-api-key>
```

---

## 🚀 **Usage**

- **Login securely** using Google OAuth.
- **Submit a health query** via text or voice input
- **AI processes the request** and generates an initial response.
- **Emergency SOS button** alerts caregivers with live location.

### **Demo Link**

🔗 [Live Deployment](https://www.notion.so/README-1bfecb13ab9080aeaca2dea01888c268?pvs=21) *(Add your Vercel link here)*

---

## 🛠 **Features**

✔ **AI-Powered Query Responses** – Patients receive instant health-related guidance.

✔ **Secure Authentication** – Google OAuth ensures safe login.

✔ **Emergency SOS Alerts** – Sends emergency notifications with patient location.

✔ **Voice-to-Text Support** – Enhances accessibility for elderly users.

✔ **Optimized UI for Seniors** – Simple, high-contrast interface for better usability.

---

## 🏗 **Project Architecture**

- **Frontend:** Next.js + Material UI
- **Backend:** Next.js API Routes (Serverless functions)
- **Database:** MongoDB (NoSQL)
- **Authentication:** NextAuth.js (Google OAuth)
- **Deployment:** Vercel

---

## 👥 **Contributing**

We welcome contributions! 🎉

### **Guidelines:**

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m "Add new feature"`
4. Push to your fork and submit a PR.

Check out our [CONTRIBUTING.md](https://www.notion.so/README-1bfecb13ab9080aeaca2dea01888c268?pvs=21) *(Add link if applicable)* for detailed guidelines.

---

## 🙌 **Credits & Acknowledgments**

---

Special thanks to:

- **Team SocDevs** – Arjav Patel, Aman Patel, Soham Das, Priyanshu Talwar
- **Hackenza 2025 Organizers** for providing this opportunity
- **Technologies Used** – Next.js, MongoDB, Material UI, Google OAuth
