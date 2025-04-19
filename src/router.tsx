import Cat from "./pages/Cat";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Upload from "./pages/Upload";
import Webcam from "./pages/Webcam";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/upload",
    Component: Upload,
  },
  {
    path: "/webcam",
    Component: Webcam,
  },
  {
    path: "/cat",
    Component: Cat,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
