import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import HomePage from "@/pages/HomePage/HomePage";
import PlanPage from "@/pages/PlanPage/PlanPage";
import MealDetailPage from "@/pages/MealDetailPage/MealDetailPage";
import PhotoRecogPage from "@/pages/PhotoRecogPage/PhotoRecogPage";
import SnackPage from "@/pages/SnackPage/SnackPage";
import ProfilePage from "@/pages/ProfilePage/ProfilePage";
import ProfileFormPage from "@/pages/ProfileFormPage/ProfileFormPage";
import WorkoutPage from "@/pages/WorkoutPage/WorkoutPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="plan" element={<PlanPage />} />
        <Route path="plan/meal/:mealType" element={<MealDetailPage />} />
        <Route path="plan/photo" element={<PhotoRecogPage />} />
        <Route path="snack" element={<SnackPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/form" element={<ProfileFormPage />} />
        <Route path="profile/workout" element={<WorkoutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
