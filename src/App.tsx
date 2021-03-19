import React from 'react';
import { render } from 'react-dom';

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
import { Profile } from './containers/Profile';
import ExamList from './containers/ExamList';
import { Exam } from './containers/Exam';
import { useCamera, UseCameraProvider } from './hooks/useCamera';

const mainElement = document.createElement('div');
mainElement.setAttribute('id', 'root');
document.body.appendChild(mainElement);
const history = createHashHistory();

const App = () => {
  const { isAuthing } = useAuth();
  const { socket } = useSocket();
  const { initializingCamera } = useCamera();

  return isAuthing || !socket || initializingCamera ? (
    <PageLoading />
  ) : (
    <>
      <GlobalStyle />
      <Layout>
        <Switch>
          <Route exact path="/" component={ExamList} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/profile" component={Profile} />
          <Route exact path="/exam/:id/join" component={Exam} />
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
            <UseCameraProvider>
              <UseLayoutProvider>
                <App />
              </UseLayoutProvider>
            </UseCameraProvider>
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
