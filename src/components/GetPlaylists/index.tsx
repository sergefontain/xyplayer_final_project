import React, { useState } from "react"
import { Row, Spinner, Col, Alert, Button, Container } from "react-bootstrap"
import { connect } from "react-redux"
import { bindActionCreators, Dispatch } from "redux"
import { PayloadActionCreator } from "typesafe-actions"
import { PlaylistsFind, TracksFind } from "../../store/main/types"
import Player from "../AudioPlayer"
import { RootAction, RootState } from "../../store/rootReducer"
import * as actions from "./../../store/actions"
import { CSSTransition } from "react-transition-group"
import "./styles.css"

interface PlaylistResolver {
  queryStatus: string
  playlistsFromRedux: PlaylistsFind | null
  getTracks: PayloadActionCreator<"main/GET_TRACKS_REQUEST", string>
}

interface TrackResolver {
  queryStatus: string
  tracksFromRedux: TracksFind | null
  userId: string
  ownerId: string
}

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const mapStateToProps = (state: RootState) => ({
  playlistsFromRedux: state.main.playlists,
  queryStatus: state.main.queryStatus,
  tracksFromRedux: state.main.tracks,
  currentPlaylistPage: state.main.currentPlaylistPage,
  pageLimitOverload: state.main.pageLimitOverload,
  ownerId: state.main.playlistOwnerId,
  userId: state.main.userId,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      getTracks: actions.getTracksReq,
      prevPlaylistPage: actions.prevPlaylistPage,
      nextPlaylistPage: actions.nextPlaylistPage,
      deleteTrack: actions.deleteTrackReq,
    },
    dispatch
  )

const GetPlaylists: React.FC<Props> = ({
  playlistsFromRedux,
  queryStatus,
  tracksFromRedux,
  getTracks,
  prevPlaylistPage,
  nextPlaylistPage,
  currentPlaylistPage,
  pageLimitOverload,
  deleteTrack,
  ownerId,
  userId,
}) => {
  const [showButton, setShowButton] = useState(true)
  const [showMessage, setShowMessage] = useState("")

  const MapPlaylistsQuery = ({
    queryStatus,
    playlistsFromRedux,
    getTracks,
  }: PlaylistResolver) => {
    if (queryStatus === "idle") {
      return <span className="my-3">Playlists Search Data</span>
    }
    if (queryStatus === "playlists_pending") {
      return <Spinner animation="grow" />
    }
    if (
      queryStatus === "playlists_succeed" ||
      queryStatus === "tracks_pending" ||
      queryStatus === "tracks_succeed"
    ) {
      if (playlistsFromRedux!.PlaylistFind) {
        let filteredPlaylist = playlistsFromRedux!.PlaylistFind.filter((z) => {
          var mySet = new Set(z.tracks)
          if (mySet.size !== 0) {
            return z
          }
        })
        return (
          <>
            {filteredPlaylist.map((x, i) => {
              if (x["name"] !== "" && x["name"] !== null) {
                return (
                  <div
                    key={i.toString()}
                    onClick={() => getTracks(x._id)}
                    className="mappedPlaylist"
                  >
                    {x.name}
                  </div>
                )
              } else {
                return null
              }
            })}
          </>
        )
      } else {
        return <div>No Data yet</div>
      }
    } else {
      return <div>unknown error!</div>
    }
  }

  const MapTracksQuery = ({
    queryStatus,
    tracksFromRedux,
    userId,
    ownerId,
  }: TrackResolver) => {
    if (
      queryStatus === "playlists_succeed" ||
      queryStatus === "idle" ||
      queryStatus === "playlists_pending"
    ) {
      return <div>Tracks Search Data</div>
    }
    if (queryStatus === "tracks_pending") {
      return <Spinner animation="grow" />
    }
    if (queryStatus === "tracks_succeed") {
      if (!tracksFromRedux) {
        return null
      } else if (tracksFromRedux!.PlaylistFindOne) {
        let filteredPlaylist = tracksFromRedux!.PlaylistFindOne.tracks.filter(
          (z) => z.url
        )
        return (
          <Container fluid className="flex-grow-1 d-flex flex-column">
            {filteredPlaylist.map((x, i, arr) => {
              return (
                <Row key={i.toString()} className="mappedSong flex-column">
                  {showButton && (
                    <Col
                      onClick={() => setShowMessage(x._id)}
                      className="d-flex flex-row justify-content-between align-items-center"
                    >
                      <div>{x.originalFileName}</div>
                      {ownerId === userId ? (
                        <div
                          onClick={() => deleteTrack(x._id)}
                          className="deleteTrackPointer pb-1"
                        >
                          <span aria-hidden="true" className="deletePoiner">
                            ×
                          </span>
                        </div>
                      ) : null}
                    </Col>
                  )}

                  <CSSTransition
                    in={x._id === showMessage}
                    timeout={300}
                    classNames="alert"
                    unmountOnExit
                    onEnter={() => setShowButton(false)}
                    onExited={() => setShowButton(true)}
                  >
                    <Col>
                      <Alert
                        variant="primary"
                        dismissible
                        onClose={() => setShowMessage("")}
                      >
                        <Alert.Heading
                          className="pr-4"
                          style={{
                            display: "inline-block",
                          }}
                        >
                          Track №:
                        </Alert.Heading>
                        <div
                          style={{
                            fontSize: "1.5rem",
                            display: "inline-block",
                          }}
                        >
                          {x.id3.trackNumber}
                        </div>
                        <Player
                          src={x.url}
                          title={x.id3.title ? x.id3.title : undefined}
                          originName={x.originalFileName}
                        />
                        <Row>
                          <Col
                            xs={6}
                            md={6}
                            lg={6}
                            className="justify-content-start d-flex"
                          >
                            <Button
                              onClick={() => setShowMessage("")}
                              size="lg"
                              style={{ width: "100%" }}
                            >
                              Close
                            </Button>
                          </Col>
                        </Row>
                      </Alert>
                    </Col>
                  </CSSTransition>
                </Row>
              )
            })}
          </Container>
        )
      } else {
        let filteredTracks = tracksFromRedux!.TrackFind.filter((z) => z.url)
        return (
          <Container fluid className="flex-grow-1 d-flex flex-column">
            {filteredTracks.map((x, i) => {
              return (
                <Row key={i.toString()} className="mappedSong flex-column">
                  {showButton && (
                    <Col onClick={() => setShowMessage(x._id)} className="">
                      <div>{x.originalFileName}</div>
                    </Col>
                  )}

                  <CSSTransition
                    in={x._id === showMessage}
                    timeout={300}
                    classNames="alert"
                    unmountOnExit
                    onEnter={() => setShowButton(false)}
                    onExited={() => setShowButton(true)}
                  >
                    <Col>
                      <Alert
                        variant="primary"
                        dismissible
                        onClose={() => setShowMessage("")}
                      >
                        <Alert.Heading
                          className="pr-4"
                          style={{
                            display: "inline-block",
                          }}
                        >
                          Track №:
                        </Alert.Heading>
                        <div
                          style={{
                            fontSize: "1.5rem",
                            display: "inline-block",
                          }}
                        >
                          {x.id3.trackNumber}
                        </div>
                        <Player
                          src={x.url}
                          title={x.id3.title ? x.id3.title : undefined}
                          originName={x.originalFileName}
                        />
                        <Row>
                          <Col
                            xs={6}
                            md={6}
                            lg={6}
                            className="justify-content-start d-flex"
                          >
                            <Button
                              onClick={() => setShowMessage("")}
                              size="lg"
                              style={{ width: "100%" }}
                            >
                              Close
                            </Button>
                          </Col>
                        </Row>
                      </Alert>
                    </Col>
                  </CSSTransition>
                </Row>
              )
            })}
          </Container>
        )
      }
    } else {
      return <div>unknown error!</div>
    }
  }
  return (
    <>
      <Row>
        <Col>
          <h2 className="forPlaylists bg-secondary rounded playCont text-white my-3">
            Playlists available
          </h2>
        </Col>
      </Row>

      <Row className="flex-grow-1 flex-column">
        <Col className="d-flex flex-row">
          <Col className="d-flex justify-content-start">
            {+currentPlaylistPage === 1 ? (
              <Button
                disabled
                onClick={() => prevPlaylistPage(`${+currentPlaylistPage - 1}`)}
              >
                Prev
              </Button>
            ) : (
              <Button
                onClick={() => prevPlaylistPage(`${+currentPlaylistPage - 1}`)}
              >
                Prev
              </Button>
            )}
          </Col>
          <div className="plyCol flex-grow-1 w-100">
            <MapPlaylistsQuery
              queryStatus={queryStatus}
              getTracks={getTracks}
              playlistsFromRedux={playlistsFromRedux}
            />
          </div>
          <Col className="d-flex justify-content-end">
            {+currentPlaylistPage > 0 && !pageLimitOverload ? (
              <Button
                onClick={() => nextPlaylistPage(`${+currentPlaylistPage + 1}`)}
              >
                Next
              </Button>
            ) : (
              <Button
                disabled
                onClick={() => nextPlaylistPage(`${+currentPlaylistPage + 1}`)}
              >
                Next
              </Button>
            )}
          </Col>
        </Col>
        <div className="px-3">
          <h2 className="forPlaylists bg-secondary rounded playCont text-white my-3">
            Tracks available
          </h2>
        </div>

        <Col className="d-flex flex-column mb-3">
          <div className="plyCol flex-grow-1">
            <MapTracksQuery
              queryStatus={queryStatus}
              tracksFromRedux={tracksFromRedux}
              ownerId={ownerId}
              userId={userId}
            />
          </div>
        </Col>
      </Row>
    </>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(GetPlaylists))
