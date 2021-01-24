import React from "react"
import { Row, Col, Button, Alert } from "react-bootstrap"
import { connect } from "react-redux"
import { CSSTransition } from "react-transition-group"
import { bindActionCreators, Dispatch } from "redux"
import { RootAction } from "../../store/rootReducer"
import * as actions from "./../../store/actions"

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      regRequest: actions.regRequest,
    },
    dispatch
  )

type Props = ReturnType<typeof mapDispatchToProps>

const Registration: React.FC<Props> = ({ regRequest }) => {
  const [login, setLogin] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [password2, setPassword2] = React.useState("")
  const [isCredsRight, setIsCredsRight] = React.useState("")
  const [isFirstStep, setIsFirstStep] = React.useState("true")
  const [isFinalStep, setIsFinalStep] = React.useState("")
  const [startSuccessMsg, setStartSuccessMsg] = React.useState("")
  const mesRegCloseRef: React.MutableRefObject<HTMLButtonElement | null> = React.useRef(
    null
  )
  const mesRegCloseRef2: React.MutableRefObject<HTMLButtonElement | null> = React.useRef(
    null
  )
  const firstStepRef: React.MutableRefObject<HTMLButtonElement | null> = React.useRef(
    null
  )
  const signUpRef: React.MutableRefObject<HTMLButtonElement | null> = React.useRef(
    null
  )

  React.useEffect(() => {
    let mesRegCloseBtn: HTMLButtonElement | null = mesRegCloseRef.current
    let mesRegCloseBtn2: HTMLButtonElement | null = mesRegCloseRef2.current
    let firstStepBtn: HTMLButtonElement | null = firstStepRef.current
    let signUpBtn: HTMLButtonElement | null = signUpRef.current

    window.onkeydown = (e: KeyboardEvent) => {
      if (e.keyCode === 13) {
        if (isCredsRight === "Wrong") {
          mesRegCloseBtn?.click()
        }
        if (isFirstStep === "true") {
          firstStepBtn?.click()
        }
        if (isFinalStep === "true") {
          signUpBtn?.click()
        }
        if (startSuccessMsg === "true") {
          mesRegCloseBtn2?.click()
        }
      }
    }
  })

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password === password2) {
      regRequest({ login, password })
    } else {
      setIsCredsRight("Wrong")
    }
  }

  return (
    <main id="registration" className="d-flex">
      <div className="container flex-grow-1 d-flex">
        <Row className="flex-grow-1">
          <Col className="h-100">
            <Row className="RegisterContainer h-100 flex-grow-1 justify-content-center align-items-center">
              <Col className="RegisterMesContainer w-50">
                <CSSTransition
                  in={isCredsRight === "Wrong"}
                  timeout={300}
                  classNames="alert"
                  unmountOnExit
                  // onEnter={() => setShowButton(false)}
                  // onExited={() => setIsCredsRight("")}
                >
                  <Alert
                    variant="primary bg-danger"
                    dismissible
                    onClose={() => {
                      setIsFirstStep("true")
                      setIsCredsRight("")
                    }}
                  >
                    <Alert.Heading className="text-warning">
                      Sorry!
                    </Alert.Heading>
                    <Row>
                      <Col className="text-light mb-3">
                        {
                          "Your <Password> on the first and the final step didn't match!"
                        }
                      </Col>
                    </Row>
                    <Row>
                      <Col className="d-flex justify-content-center">
                        <Button
                          variant="light"
                          ref={mesRegCloseRef}
                          onClick={() => {
                            setIsFirstStep("true")
                            setIsCredsRight("")
                          }}
                          className="border-0"
                        >
                          Try Again!
                        </Button>
                      </Col>
                    </Row>
                  </Alert>
                </CSSTransition>
              </Col>

              <div className="RegisterInputSubContainer w-50">
                <CSSTransition
                  in={isFirstStep === "true"}
                  timeout={300}
                  classNames="alert"
                  unmountOnExit
                >
                  <form className="bg-light pt-4 pb-5 px-5 fs2rm">
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
                          ref={firstStepRef}
                          className="mt-4"
                          size="lg"
                          onClick={() => {
                            setIsFirstStep("")
                            setStartSuccessMsg("true")
                          }}
                        >
                          Register!
                        </Button>
                      </Col>
                    </Row>
                  </form>
                </CSSTransition>
              </div>

              <Col className="RegisterMesContainer w-50">
                <CSSTransition
                  in={startSuccessMsg === "true"}
                  timeout={300}
                  classNames="alert"
                  unmountOnExit
                >
                  <Alert
                    variant="primary bg-success"
                    dismissible
                    onClose={() => {
                      setIsFinalStep("true")
                      setStartSuccessMsg("")
                    }}
                  >
                    <Alert.Heading className="text-warning">
                      Almost Ready!
                    </Alert.Heading>
                    <Row>
                      <Col className="text-light mb-3">
                        {"Repeat your <Password> one more time and Welcome!"}
                      </Col>
                    </Row>
                    <Row>
                      <Col className="d-flex justify-content-center">
                        <Button
                          variant="light"
                          ref={mesRegCloseRef2}
                          onClick={() => {
                            setIsFinalStep("true")
                            setStartSuccessMsg("")
                          }}
                          className="border-0"
                        >
                          Proceed To Complete
                        </Button>
                      </Col>
                    </Row>
                  </Alert>
                </CSSTransition>
              </Col>

              <div className="RegisterFormSubmit w-50">
                <CSSTransition
                  in={isFinalStep === "true"}
                  timeout={300}
                  classNames="alert"
                  unmountOnExit
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
                        Password
                      </label>
                      <Col>
                        <input
                          value={password2}
                          onChange={(e) => setPassword2(e.target.value)}
                          type="password"
                          id="password2"
                          className="form-control"
                        />
                      </Col>
                    </Row>

                    <Row>
                      <Col className="d-flex justify-content-center">
                        <Button
                          ref={signUpRef}
                          className="mt-4"
                          size="lg"
                          onClick={() => setIsFinalStep("")}
                          type="submit"
                        >
                          {"Complete & Login Now!"}
                        </Button>
                      </Col>
                    </Row>
                  </form>
                </CSSTransition>
              </div>
            </Row>
          </Col>
        </Row>
      </div>
    </main>
  )
}
export default connect(null, mapDispatchToProps)(React.memo(Registration))
