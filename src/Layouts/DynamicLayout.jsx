import { Outlet, useLocation } from "react-router-dom";

export default function DynamicLayout() {
  const { pathname } = useLocation();

  return <Outlet key={pathname} />;
}
