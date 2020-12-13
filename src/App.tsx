import React from "react"
import logo from "./xy_logo_100x180.png"
import "./App.css"
import * as routes from "./routes"
import { BrowserRouter, Link, Redirect, Route, Switch } from "react-router-dom"

import Login from "./components/Login"
import Registration from "./components/Registration"
import GetStarted from "./components/GetStarted"

function App() {
  const [isAuth, setIsAuth] = React.useState(false)

  return (
    <>
      <BrowserRouter>
        <div id="wrapper">
            <header id="header">
              <div className="container-fluid">
                <nav>
                  <li>
                    <Link to={routes.LOGIN}>Login</Link>
                  </li>
                </nav>
              </div>
            </header>
            <Switch>
              <Route path={routes.HOMEPAGE} component={GetStarted} />
              <Route path={routes.REGISTRATION} component={Registration} />

              <Route path={routes.LOGIN} component={Login} />

              <Redirect from={routes.HOMEPAGE} exact to={routes.REGISTRATION} />
              <Redirect to={routes.ERRORPAGE} />
            </Switch>
            <footer id="footer"></footer>
          </div>
      </BrowserRouter>
    </>
  )
}

export default App
