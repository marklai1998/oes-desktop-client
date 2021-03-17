import React from 'react';
import { render } from 'react-dom';

import Greetings from './components/Greetings';
import { Router, Route } from 'react-router';
import { UserSocketProvider, useSocket } from './hooks/useSocket';
import { useAuth, UserAuthProvider } from './hooks/useAuth';
import { PageLoading } from './components/PageLoading';
import { Login } from './containers/Login';
import { RecoilRoot } from 'recoil';
import { UseTimeProvider } from './hooks/useTime';
import { UseLayoutProvider } from './hooks/useLayout';
import { createHashHistory } from 'history';

const mainElement = document.createElement('div');
mainElement.setAttribute('id', 'root');
document.body.appendChild(mainElement);
const history = createHashHistory();

const App = () => {
  const { isAuthing } = useAuth();
  const { socket } = useSocket();
  return isAuthing || !socket ? (
    <PageLoading />
  ) : (
    <>
      <Route exact path="/" component={Greetings} />
      <Route exact path="/login" component={Login} />
    </>
  );
};

render(
  <Router history={history}>
    <RecoilRoot>
      <UserAuthProvider>
        <UserSocketProvider>
          <UseTimeProvider>
            <UseLayoutProvider>
              <App />
            </UseLayoutProvider>
          </UseTimeProvider>
        </UserSocketProvider>
      </UserAuthProvider>
    </RecoilRoot>
  </Router>,
  mainElement
);
