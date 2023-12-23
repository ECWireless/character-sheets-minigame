import '@fontsource/unbounded/200.css';
import '@fontsource/unbounded/300.css';
import '@fontsource/unbounded/400.css';
import '@fontsource/unbounded/500.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { GameView } from './views/Game';
import { LobbyView } from './views/Lobby';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LobbyView />,
  },
  {
    path: '/:gameId',
    element: <GameView />,
  },
]);

export const App: React.FC = () => {
  return <RouterProvider router={router} />;
};
