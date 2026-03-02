import { Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";

// lazy imports
const LoginPage = React.lazy(() => import("../pages/public/Login"));
const RegisterPage = React.lazy(() => import("../pages/public/Register"));
const DashboardPage = React.lazy(() => import("../pages/private/Dashboard"));
const TaskPage = React.lazy(() => import("../pages/private/Tasks"));
const CreateTaskPage = React.lazy(() => import("../pages/private/tasks/CreateTask"));
const ProjectsPage = React.lazy(() => import("../pages/private/Projects"));
const SettingsPage = React.lazy(() => import("../pages/private/Settings"));

const publicRoutes = [
  {
    route: "/login",
    component: <LoginPage />,
  },
  {
    route: "/register",
    component: <RegisterPage />,
  },
];

const privateRoutes = [
  {
    route: "/dashboard",
    component: <DashboardPage />,
  },
  {
    route: "/tasks",
    component: <TaskPage />,
  },
  {
    route: "/tasks/create-task",
    component: <CreateTaskPage />,
  },
  {
    route: "/projects",
    component: <ProjectsPage />,
  },
  {
    route: "/settings",
    component: <SettingsPage />,
  },
];

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route element={<PublicRoute />}>
          {publicRoutes.map((route) => (
            <Route key={route.route} path={route.route} element={route.component} />
          ))}
        </Route>

        <Route element={<PrivateRoute />}>
          {privateRoutes.map((route) => (
            <Route key={route.route} path={route.route} element={route.component} />
          ))}
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
