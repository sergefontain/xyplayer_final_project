import React from "react"
import { Row, Col, Button } from "react-bootstrap"
import { connect } from "react-redux"
import { bindActionCreators, Dispatch } from "redux"
import { RootAction} from "../../store/rootReducer"
import * as actions from "./../../store/actions"

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      authRequest: actions.authRequest,
    },
    dispatch
  )

type Props = ReturnType<typeof mapDispatchToProps>

const Login: React.FC<Props> = ({ authRequest }) => {
  const [login, setLogin] = React.useState("")
  const [password, setPassword] = React.useState("")

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    authRequest({ login, password })
  }

  return (
    <main id="login" className="d-flex">
      <div className="container flex-grow-1 d-flex">
        <Row className="flex-grow-1">
          <Col className="d-flex flex-column align-items-center justify-content-center">
            <form className="bg-light pt-4 pb-5 px-5 fs2rm" onSubmit={onSubmit}>
              <Row className="form-group d-flex flex-column mx-2">
                <label htmlFor="login" className="col-sm-2 col-form-label">
                  Login
                </label>
                <Col>
                  <input
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    type="text"
                    id="login"
                    className="form-control"
                  />
                </Col>
              </Row>
              <Row className="form-group d-flex flex-column mx-2">
                <label htmlFor="login" className="col-sm-2 col-form-label">
                  Password
                </label>
                <Col>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    id="password"
                    className="form-control"
                  />
                </Col>
              </Row>
              <Row>
                <Col className="d-flex justify-content-center">
                  <Button className="mt-4" size="lg" type="submit">
                    Sign-In
                  </Button>
                </Col>
              </Row>
            </form>
          </Col>
        </Row>
      </div>
    </main>
  )
}
export default connect(null, mapDispatchToProps)(React.memo(Login))
