import React from "react";

export default function Dashboard() {
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <h1 className="text-3xl font-bold mb-6">مرحباً بك في لوحة التحكم 🎉</h1>
      <button
        onClick={handleLogout}
        className="px-6 py-2 rounded-xl bg-red-500 text-white shadow hover:bg-red-600"
      >
        تسجيل الخروج
      </button>
    </div>
  );
}
