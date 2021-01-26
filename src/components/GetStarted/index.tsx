import React, { FormEvent, useMemo, useState } from "react"
import { Container, Col, Row } from "react-bootstrap"
import Dropzone, {
  IDropzoneProps as DropzoneProps,
  IInputProps as InputProps,
} from "react-dropzone-uploader"
import { RootAction, RootState } from "../../store/rootReducer"
import * as actions from "./../../store/actions"
import GetPlaylists from "../GetPlaylists"
import { connect } from "react-redux"
import { bindActionCreators, Dispatch } from "redux"
import { getDroppedOrSelectedFiles } from "html5-file-selector"
import "./styles.css"

const mapStateToProps = (state: RootState) => ({
  queryStatus: state.main.queryStatus,
  creationStatus: state.main.creationStatus,
  createError: state.main.preCreateError,
  playingStatus: state.play.playingStatus,
  isTrackPlay: state.play.playState,
  searchStatus: state.main.searchStatus,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      createPlaylist: actions.createPlaylistReq,
      tracksToUpload: actions.createTracksArrayReq,
    },
    dispatch
  )

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const GetStarted: React.FC<Props> = ({
  createPlaylist,
  tracksToUpload,
  queryStatus,
  creationStatus,
  createError,
  playingStatus,
  isTrackPlay,
  searchStatus,
}) => {
  const [namePlaylist, setNamePlaylist] = useState("")
  const [descPlaylist, setDescPlaylist] = useState("")
  const [isUploadDone, setIsUploadDone] = useState("pending")
  const [isFormFilled, setIsFormFilled] = useState(false)
  let allmightyArr: Array<number> = useMemo<number[]>(() => [], [])
  let trackToSagaArr: Array<File> = useMemo<File[]>(() => [], [])

  React.useEffect(() => {
    if (isUploadDone === "done" && isFormFilled) {
      tracksToUpload(trackToSagaArr)
      createPlaylist({
        name: namePlaylist,
        description: descPlaylist,
      })
      setNamePlaylist("")
      setDescPlaylist("")
      const closeButtonArr = Array.from(
        document.getElementsByClassName("dzu-previewButton")
      )
      closeButtonArr.map((button: any) => button.click())
    }
  }, [
    isUploadDone,
    tracksToUpload,
    trackToSagaArr,
    isFormFilled,
    namePlaylist,
    descPlaylist,
    createPlaylist,
  ])

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsFormFilled(true)
  }

  const Input = ({ accept, onFiles, files, getFilesFromEvent }: InputProps) => {
    const text = files.length > 0 ? "Add more files" : "Choose files"
    return (
      <Col>
        <label
          style={{
            color: "#fff",
            cursor:
              queryStatus === "playlists_pending" ||
              queryStatus === "tracks_pending" ||
              queryStatus === "failure" ||
              !!searchStatus ||
              !!(playingStatus || isTrackPlay) ||
              creationStatus ||
              !!createError
                ? "default"
                : "pointer",
            padding: 5,
            borderRadius: 3,
            pointerEvents:
              queryStatus === "playlists_pending" ||
              queryStatus === "tracks_pending" ||
              queryStatus === "failure" ||
              !!searchStatus ||
              !!(playingStatus || isTrackPlay) ||
              creationStatus ||
              !!createError
                ? "none"
                : "auto",
          }}
          className="unselectable"
        >
          {text}

          <input
            style={{ display: "none" }}
            type="file"
            accept={accept}
            multiple
            onChange={async (e) => {
              setIsUploadDone("")
              const chosenFiles = await getFilesFromEvent(e)
              onFiles(chosenFiles as File[])
            }}
          />
        </label>
        {files.length > 0 ? null : (
          <Row>
            <div
              className={
                queryStatus === "playlists_pending" ||
                queryStatus === "tracks_pending" ||
                queryStatus === "failure" ||
                !!searchStatus ||
                !!(playingStatus || isTrackPlay) ||
                creationStatus ||
                !!createError ||
                isTrackPlay
                  ? "dz-bg"
                  : "dz-bg-act"
              }
            ></div>
          </Row>
        )}
      </Col>
    )
  }

  const tracksToSagaArrModify = (name: string): void => {
    let index = trackToSagaArr.findIndex((file) => file.name === name)
    trackToSagaArr.splice(index, 1)
  }

  const getFilesFromEvent = async (e: any) => {
    const chosenFiles = await getDroppedOrSelectedFiles(e)
    trackToSagaArr.push(...chosenFiles)
    return chosenFiles.map((f: { fileObject: File }) => f.fileObject)
  }

  const handleChangeStatus: DropzoneProps["onChangeStatus"] = (
    { meta },
    status
  ) => {
    if (meta.status === "preparing") {
      setIsUploadDone("uploading")
      allmightyArr.push(1)
    }
    if (meta.status === "removed") {
      allmightyArr.pop()
      tracksToSagaArrModify(meta.name)
    }
    if (status === "done") {
      allmightyArr.pop()
      if (allmightyArr.length === 0) {
        setIsUploadDone("done")
      }
    }
  }

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
                  <p
                    className={
                      queryStatus === "playlists_pending" ||
                      queryStatus === "tracks_pending" ||
                      queryStatus === "failure" ||
                      !!searchStatus ||
                      !!(playingStatus || isTrackPlay) ||
                      creationStatus ||
                      !!createError ||
                      isTrackPlay
                        ? "py-1 px-3 bg-secondary rounded text-truncate bd-highlight unselectable"
                        : "py-1 px-3 bg-warning rounded text-truncate bd-highlight titleCreatePly unselectable"
                    }
                  >
                    Say something 'bout your playlist!
                  </p>
                </Col>
              </Row>
              <Row>
                <Col className="">
                  <Col className="d-flex flex-row mt-2 mb-4">
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

                  <Col className="d-flex flex-row mb-3">
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
                </Col>
                <Col className="mt-2">
                  <Dropzone
                    accept="audio/*"
                    getUploadParams={() => ({
                      url: "https://httpbin.org/post",
                    })}
                    InputComponent={Input}
                    getFilesFromEvent={getFilesFromEvent}
                    onChangeStatus={handleChangeStatus}
                    addClassNames={{
                      dropzone:
                        queryStatus === "playlists_pending" ||
                        queryStatus === "tracks_pending" ||
                        queryStatus === "failure" ||
                        creationStatus ||
                        !!searchStatus ||
                        !!(playingStatus || isTrackPlay) ||
                        !!createError ||
                        isTrackPlay
                          ? "dzu-dropzone-disabled"
                          : "",
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col className="d-flex justify-content-center">
                  <div className=" forForm">
                    <button
                      disabled={
                        !(playingStatus === "playing" || isTrackPlay) &&
                        (isUploadDone === "done" && namePlaylist && descPlaylist)
                          ? false
                          : true
                      }
                      type="submit"
                      className="px-5 py-2 mb-3 rounded"
                      style={{
                        background:
                        !(playingStatus === "playing" || isTrackPlay) &&
                          isUploadDone === "done" &&
                          namePlaylist &&
                          descPlaylist
                            ? ""
                            : "grey",
                      }}
                    >
                      Send
                    </button>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(GetStarted))
