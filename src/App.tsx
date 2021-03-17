import React from 'react';
import { render } from 'react-dom';

import Greetings from './components/Greetings';
import { Router, Route, Switch } from 'react-router';
import { UserSocketProvider, useSocket } from './hooks/useSocket';
import { useAuth, UserAuthProvider } from './hooks/useAuth';
import { PageLoading } from './components/PageLoading';
import { Login } from './containers/Login';
import { RecoilRoot } from 'recoil';
import { UseTimeProvider } from './hooks/useTime';
import { UseLayoutProvider } from './hooks/useLayout';
import { createHashHistory } from 'history';
import { createGlobalStyle } from 'styled-components';
import { Layout } from './containers/_Layout';
import 'antd/dist/antd.css';

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
      <GlobalStyle />
      <Layout>
        <Switch>
          <Route exact path="/" component={Greetings} />
          <Route exact path="/login" component={Login} />
        </Switch>
      </Layout>
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

const GlobalStyle = createGlobalStyle`
body{
  background-color:#f9f9f9;
}
`;
