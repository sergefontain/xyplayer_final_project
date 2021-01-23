import React from "react"
import { Row, Col, Button, Alert } from "react-bootstrap"
import { connect } from "react-redux"
import { CSSTransition } from "react-transition-group"
import { bindActionCreators, Dispatch } from "redux"
import { RootAction, RootState } from "../../store/rootReducer"
import * as actions from "./../../store/actions"

const mapStateToProps = (state: RootState) => ({
  authStatus: state.auth.authStatus,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      authRequest: actions.authRequest,
      statusAnigilate: actions.setEmptyAuthStatus,
    },
    dispatch
  )

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>

const Login: React.FC<Props> = ({
  authRequest,
  authStatus,
  statusAnigilate,
}) => {
  const [login, setLogin] = React.useState("")
  const [password, setPassword] = React.useState("")
  const alertCloseRef: React.MutableRefObject<HTMLButtonElement | null> = React.useRef(
    null
  )
  const signInRef: React.MutableRefObject<HTMLButtonElement | null> = React.useRef(
    null
  )

  React.useEffect(() => {
    let alertCloseBtn: HTMLButtonElement | null = alertCloseRef.current
    let signInBtn: HTMLButtonElement | null = signInRef.current
    if (authStatus === "failure") {
      window.onkeyup = (e: KeyboardEvent) => {
        if (e.keyCode === 13) {
          alertCloseBtn?.click()
        }
      }
    } else {
      window.onkeyup = (e: KeyboardEvent) => {
        if (e.keyCode === 13) {
          signInBtn?.click()
        }
      }
    }
  }, [authStatus])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    authRequest({ login, password })
  }

  return (
    <main id="login" className="d-flex">
      <div className="container flex-grow-1 d-flex">
        <Row className="flex-grow-1">
          <Col className="h-100">
            <Row className="LoginContainer h-100 flex-grow-1 justify-content-center align-items-center">
              <Col className="LoginAlertContainer w-50">
                <CSSTransition
                  in={authStatus === "failure"}
                  timeout={300}
                  classNames="alert"
                  unmountOnExit
                  // onEnter={() => setShowButton(false)}
                  // onExited={() => statusAnigilate()}
                >
                  <Alert
                    variant="primary bg-danger"
                    dismissible
                    onClose={statusAnigilate}
                  >
                    <Alert.Heading className="text-warning">
                      Sorry!
                    </Alert.Heading>
                    <Row>
                      <Col className="text-light mb-3">
                        Entered Credentials is incorrect!
                      </Col>
                    </Row>
                    <Row>
                      <Col className="d-flex justify-content-center">
                        <Button
                          variant="light"
                          ref={alertCloseRef}
                          onClick={statusAnigilate}
                          className="border-0"
                        >
                          Try Again
                        </Button>
                      </Col>
                    </Row>
                  </Alert>
                </CSSTransition>
              </Col>

              <Col className="LoginCredsContainer w-50">
                <CSSTransition
                  in={authStatus === ""}
                  timeout={300}
                  classNames="alert"
                  unmountOnExit
                  // onEnter={() => setShowButton(false)}
                  // onExited={() => statusAnigilate()}
                >
                  <form
                    className="bg-light pt-4 pb-5 px-5 fs2rm"
                    onSubmit={onSubmit}
                  >
                    <Row className="form-group d-flex flex-column mx-2">
                      <label
                        htmlFor="login"
                        className="col-sm-2 col-form-label"
                      >
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
                      <label
                        htmlFor="login"
                        className="col-sm-2 col-form-label"
                      >
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
                        <Button
                          ref={signInRef}
                          className="mt-4"
                          size="lg"
                          type="submit"
                        >
                          Sign-In
                        </Button>
                      </Col>
                    </Row>
                  </form>
                </CSSTransition>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </main>
  )
}
export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Login))
