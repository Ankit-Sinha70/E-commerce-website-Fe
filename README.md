# 🧊 E-commerce Website (Frontend)

This is the **frontend** of the NaturalIce E-commerce platform built with **React + Vite**, using modern tools and best practices. It includes a fully responsive **user and admin panel**, real-time notifications, and an elegant UI using ShadCN components.

---

## 🛠️ Tech Stack

- ⚛️ **React** – Core library
- ⚡ **Vite** – Fast build tool with HMR
- 🧩 **Redux Toolkit** – State management
- 🎨 **ShadCN UI** – Beautiful, accessible components
- 🧱 **ShadCN Icons** – Icon library
- 🔔 **Socket.IO** – Real-time notifications
- 🧪 **ESLint + Prettier** – Code quality and formatting
- 📱 **Fully Responsive** – Mobile-first design

---

## 📁 Project Structure

```bash
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable components
│   ├── features/          # Redux slices & feature-specific logic
│   ├── pages/             # Application pages (User/Admin)
│   ├── routes/            # Route configuration
│   ├── services/          # API service logic
│   ├── sockets/           # Socket.IO logic
│   ├── store/             # Redux store setup
│   ├── styles/            # SCSS/CSS styling
│   └── utils/             # Utility/helper functions
├── .eslintrc.cjs
├── .prettierrc
├── vite.config.ts
└── README.md
