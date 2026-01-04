import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./app/page";
import DashboardPage from "./app/dashboard/page";
import ProfilesPage from "./app/profiles/page";
import SettingsPage from "./app/settings/page";
import RootLayout from "./app/layout";

export default function App() {
  return (
    <RootLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profiles" element={<ProfilesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </RootLayout>
  );
}
