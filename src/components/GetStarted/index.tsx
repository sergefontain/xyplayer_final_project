import React, { useState } from "react"
import { Container, Button, Alert } from "react-bootstrap"
import { CSSTransition } from "react-transition-group"
import "./styles.css"

import Player from "../AudioPlayer"
import song01 from "./01.mp3"
import song02 from "./02.mp3"
import song03 from "./03.mp3"

const arrToMap = [song01, song02, song03]

const GetStarted = () => {
  const [showButton, setShowButton] = useState(true)
  const [showMessage, setShowMessage] = useState(false)
  const ref: any = React.useRef()



  // let filteredArr = arrToMap.filter((x, index, arr) => {
  //   if (index > arr.length - index) {
  //     arr.slice(index)
  //     console.log(arr)
  //   }
  // })
  // console.log(filteredArr) setShowMessage(true)

  return (
    <main id="login">
      <div className="container-fluid">
        <div className="row">
          <div className="col" ref={ref}>
            {arrToMap.map((x, index, arr) => {
              return (
                <div className="row" key={index.toString()}>
                  {showButton && <Button onClick={() => setShowMessage(true)} size="lg">Show Message</Button>}
                  <CSSTransition
                    in={showMessage}
                    timeout={300}
                    classNames="alert"
                    unmountOnExit
                    onEnter={() => setShowButton(false)}
                    onExited={() => setShowButton(true)}
                  >
                    <Alert
                      variant="primary"
                      dismissible
                      onClose={() => setShowMessage(false)}
                    >
                      <Alert.Heading>Animated alert message</Alert.Heading>
                      <p>
                        This alert message is being transitioned in and out of
                        the DOM.
                      </p>
                      <Player src={x} />
                      <Button onClick={() => setShowMessage(false)}>
                        Close
                      </Button>
                    </Alert>
                  </CSSTransition>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}

export default React.memo(GetStarted)
