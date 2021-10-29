import React, { FC, useReducer, useState, useEffect } from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router-dom';
import AuthRoute from './components/AuthRoute';
import LoadingComponent from './components/LoadingComponent';
import logging from './config/logging';
import routes from './config/routes';
import { initialUserState, UserContextProvider, userReducer } from './contexts/user';
import { Validate } from './modules/auth';

export interface IApplicationProps { }

const App: FC<IApplicationProps> = (props) => {
  const [userState, userDispatch] = useReducer(userReducer, initialUserState);
  const [loading, setLoading] = useState<boolean>(true);
  const [authStage, setAuthStage] = useState<string>('Checking localstorage ...');

  console.log(authStage);
  useEffect(() => {
    setTimeout(() => {
        CheckLocalStorageForCredentials();
    }, 1000);

    // eslint-disable-next-line
  }, []);

  const CheckLocalStorageForCredentials = () => {
    setAuthStage('Checking credentials ...');
    const fire_token = localStorage.getItem('fire_token');
    if (fire_token === null) {
      userDispatch({ type: 'logout', payload: initialUserState });
      setAuthStage('No credentials found');
      setTimeout(() => {
          setLoading(false);
      }, 500);
    }
    else {
      return Validate(fire_token, (error, user) => {
        if (error) {
          setAuthStage('user not found, logging out ..');
          logging.error(error);
          userDispatch({ type: 'logout', payload: initialUserState });
          setTimeout(() => {
            setLoading(false);
        }, 500);
        }
        else if (user) {
          setAuthStage('user authenticated');
          userDispatch({ type: 'login', payload: { user, fire_token } });
          setTimeout(() => {
            setLoading(false);
          }, 500);
        }
      })
    }
  }

  const userContextValues = { userState, userDispatch };
  if (loading) {
    return <LoadingComponent>{authStage}</LoadingComponent>;
  }

  return (
    <UserContextProvider value={userContextValues}>
      <Switch>
        { routes.map((route,i) => {
          if (route.auth) {
            return (
              <Route
                path={route.path}
                exact={route.exact}
                key={i}
                render={(routeProps: RouteComponentProps) => <AuthRoute><route.component {...routeProps} /></AuthRoute> }
              />
            );
          }
          return (
            <Route 
              key={i} 
              exact={route.exact} 
              path={route.path} 
              render={(routeProps: RouteComponentProps) => <route.component {...routeProps} />}
            />
          )
        }) }
      </Switch>
    </UserContextProvider>
  );
}

export default App;
