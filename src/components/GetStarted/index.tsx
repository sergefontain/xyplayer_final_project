import React, { FormEvent, useState } from "react"
import { Container, Button, Col, Row } from "react-bootstrap"

import { RootAction } from "../../store/rootReducer"
import * as actions from "./../../store/actions"

import GetPlaylists from "../GetPlaylists"
import { connect } from "react-redux"
import { bindActionCreators, Dispatch } from "redux"

// import { v4 as uuidv4 } from "uuid"

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      preCreatePlaylist: actions.preCreatePlaylist,
      createPlaylist: actions.createPlaylistReq,
    },
    dispatch
  )

type Props = ReturnType<typeof mapDispatchToProps>

const GetStarted: React.FC<Props> = ({ createPlaylist }) => {
  const [namePlaylist, setNamePlaylist] = useState("")
  const [descPlaylist, setDescPlaylist] = useState("")
  const labelVal: React.RefObject<HTMLDivElement> = React.useRef(null)
  const inputFile: React.RefObject<HTMLInputElement> = React.useRef(null)

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    createPlaylist({
      name: namePlaylist,
      description: descPlaylist,
      files: Array.from(e.target[2].files),
    })
  }

  React.useEffect(() => {
    const jsMessage = labelVal!.current
    const tracksInput = inputFile!.current

    const handler = (e: Event) => {
      let countFiles: string = ""
      let labelMes = jsMessage!.innerText
      const files = Array.from(e.target!.files)
      if (files && files.length >= 1) {
        countFiles = `${files.length}`
      }
      if (countFiles) {
        jsMessage!.innerText = "Files chosen: " + countFiles
      } else {
        jsMessage!.innerText = labelMes
      }
    }
    if (tracksInput) {
      tracksInput!.addEventListener("change", handler)
      return () => tracksInput!.removeEventListener("change", handler)
    }
  }, [])

  return (
    <main id="getStarted" className="d-flex">
      <Container fluid className="flex-grow-1 d-flex flex-column">
        <GetPlaylists />

        <Row>
          <Col className="plyCol">
            <form
              encType="multipart/form-data"
              method="post"
              action=""
              onSubmit={submitHandler}
            >
              <Row>
                <Col className="my-3 forForm d-flex justify-content-center">
                  <p className="py-1 px-3 bg-warning rounded text-truncate bd-highlight">
                    Say something 'bout your playlist!
                  </p>
                </Col>
              </Row>
              <Row>
                <Col className="">
                  <Row>
                    <Col
                      sm={12}
                      md={12}
                      lg={6}
                      xl={6}
                      className="d-flex flex-row"
                    >
                      <label
                        htmlFor="namePlaylist"
                        className="col-3 col-sm-3 col-md-2 col-form-label forFormLabel d-flex justify-content-end"
                      >
                        Name it!
                      </label>
                      <input
                        className="form-control "
                        value={namePlaylist}
                        name="namePlaylist"
                        id="namePlaylist"
                        type="text"
                        onChange={(e) => setNamePlaylist(e.target.value)}
                      />
                    </Col>
                    <Col
                      sm={12}
                      md={12}
                      lg={6}
                      xl={6}
                      className="d-flex flex-row"
                    >
                      <label
                        htmlFor="descPlaylist"
                        className="col-3 col-sm-3 col-md-2 col-form-label forFormLabel d-flex justify-content-end"
                      >
                        Describe it!
                      </label>
                      <input
                        className="form-control col-xs-9"
                        value={descPlaylist}
                        id="descPlaylist"
                        name="descPlaylist"
                        type="text"
                        onChange={(e) => setDescPlaylist(e.target.value)}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div className="field__wrapper">
                    <input
                      ref={inputFile}
                      name="audioFile"
                      type="file"
                      accept="audio/*"
                      id="audioFile"
                      className="field field__file"
                      multiple
                    />

                    <label className="field__file-wrapper" htmlFor="audioFile">
                      <div
                        ref={labelVal}
                        className="field__file-fake"
                        style={{ lineHeight: "16px" }}
                      >
                        File do not chosen
                      </div>
                      <div className="field__file-button">Attach Files</div>
                    </label>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col className="d-flex justify-content-center">
                  <div>
                    <Button type="submit" className="px-5 mb-3 forForm">
                      Send
                    </Button>
                  </div>
                </Col>
              </Row>
            </form>
          </Col>
        </Row>
      </Container>
    </main>
  )
}

export default connect(null, mapDispatchToProps)(React.memo(GetStarted))
