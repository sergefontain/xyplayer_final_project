import React from "react"
import logo from "./xy_logo_100x180.png"
import "./App.css"
import { BrowserRouter, Link, Redirect, Route, Switch } from "react-router-dom"
import { connect } from "react-redux"
import { RootState, RootAction } from "./store/rootReducer"
import * as routes from "./routes"
import Registration from "./components/Registration"
import NotFound from "./components/NotFound"
import GetStarted from "./components/GetStarted"
import Login from "./components/Login"
import { bindActionCreators, Dispatch } from "redux"
import * as actions from "./store/actions"


const mapStateToProps = (state: RootState) => ({
  isAuth: state.auth.isLogon,
})
const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators({ logoutToProps: () => actions.logout() }, dispatch)

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

function App({ isAuth, logoutToProps }: Props) {

  const ProtectedRoute = (props: any) => {
    if (isAuth) {
      return <Route {...props} />
    }
    return <Redirect from="/" exact to={routes.LOGIN} />
  }

  const Logout = ({ logout }: any) => {
    const handleLogout = () => {
      localStorage.removeItem("token")
      logout()
    }
    return (
      <a className="menu__item" href="#!" onClick={handleLogout}>
        logout
      </a>
    )
  }

  return (
    <BrowserRouter>
      <div id="wrapper">
        <header id="header">
          <div className="container">
            <div className="header-logo mr-4">
              <a href="/">
                <img src={logo} alt="logo yoga" />
              </a>
            </div>
            <div className="slogan d-flex flex-column mr-auto">
              <span>Make Your Innervoice</span><span>Global!</span>
            </div>
            <nav className="main-nav">
              <input id="menu__toggle" type="checkbox" />
              <label className="menu__btn" htmlFor="menu__toggle">
                <span></span>
              </label>
              <div className="menu-holder">
                <ul className="menu__box">
                  {!isAuth && (
                    <>
                      <li>
                        <Link className="menu__item" to={routes.REGISTRATION}>
                          Registration
                        </Link>
                      </li>
                      <li>
                        <Link className="menu__item" to={routes.LOGIN}>
                          Login
                        </Link>
                      </li>
                    </>
                  )}
                  {isAuth && (
                    <li>
                      <Logout logout={logoutToProps} />
                    </li>
                  )}
                </ul>
              </div>
            </nav>
          </div>
        </header>
        <Switch>
          {!isAuth ? (
            <Route path={routes.LOGIN} component={Login} />
          ) : (
            <Redirect from={routes.LOGIN} exact to={routes.MAIN} />
          )}
          {!isAuth ? (
            <Route path={routes.REGISTRATION} component={Registration} />
          ) : (
            <Redirect from={routes.REGISTRATION} exact to={routes.MAIN} />
          )}
          <ProtectedRoute path={routes.MAIN} component={GetStarted} />
          <Route path={routes.ERROR} component={NotFound} />
          <Redirect from="/" exact to={routes.LOGIN} />
          <Redirect to={routes.ERROR} />
        </Switch>
        <footer id="footer"></footer>
      </div>
    </BrowserRouter>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
