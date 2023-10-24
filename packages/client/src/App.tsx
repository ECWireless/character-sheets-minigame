import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LobbyView } from "./views/Lobby";
import { GameView } from "./views/Game";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LobbyView />,
  },
  {
    path: "/:gameId",
    element: <GameView />,
  },
]);

export const App = () => {
  return <RouterProvider router={router} />;
};
