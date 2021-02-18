import React, { useState, useMemo } from "react"
import {
  Row,
  Spinner,
  Col,
  Alert,
  Button,
  Container,
  ToggleButton,
  ButtonGroup,
} from "react-bootstrap"
import { connect } from "react-redux"
import { bindActionCreators, Dispatch } from "redux"
import { PayloadActionCreator } from "typesafe-actions"
import { Track, Playlist, PlaylistsFind } from "../../store/main/types"
import Player from "../AudioPlayer"
import { RootAction, RootState } from "../../store/rootReducer"
import * as actions from "./../../store/actions"
import "./styles.css"
import { SortableContainer, SortableElement } from "react-sortable-hoc"
import arrayMove from "array-move"
import img01 from "../../store/pics/eu1_1200x1200.jpg"
import img02 from "../../store/pics/eu4_768_768.jpg"
import img03 from "../../store/pics/eu5_935x935.jpg"
import img04 from "../../store/pics/eu6_1080x1080.jpg"
import img05 from "../../store/pics/euMM_594x594.jpg"
import img06 from "../../store/pics/emo1.jpg"
import img07 from "../../store/pics/emo2.jpg"
import img08 from "../../store/pics/emo3.jpg"
import img09 from "../../store/pics/emo4.jpg"
import img10 from "../../store/pics/emo5.jpg"

const MIN_TRACKS_ON_PAGE = 4
const MIN_TRACK_PAGES = 2
const MAX_TRACK_PAGES = 4

interface PlaylistResolver {
  queryStatus: string
  playlistsFromRedux: PlaylistsFind
  getTracks: PayloadActionCreator<"main/GET_TRACKS_REQUEST", string>
}

export interface TrackResolver {
  queryStatus: string
  unsortedTracks: Array<Track>
  nextImg: string
  buttonsArr: {
    prevButton: HTMLButtonElement | null
    nextButton: HTMLButtonElement | null
  }
  closeBtnRef: React.MutableRefObject<HTMLButtonElement | null>
}

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const mapStateToProps = (state: RootState) => ({
  playlistsFromRedux: state.main.playlists,
  queryStatus: state.main.queryStatus,
  currentPlaylistPage: state.main.currentPlaylistPage,
  pageLimitOverload: state.main.pageLimitOverload,
  ownerId: state.main.playlistOwnerId,
  userId: state.main.userId,
  unsortedTracks: state.main.unsortedTracksArr,
  playlistSortRule: state.main.playlistBackendSortRule,
  orderPlay: state.main.trackOrderToPlay,
  trackPageLimitOverload: state.main.trackPageLimitOverload,
  currentTrackPage: state.main.currentTrackPage,
  turnOnTracksPlay: state.play.turnOnTracksPlay,
  playlistIdOld: state.main.playlistIdOld,
  creationStatus: state.main.creationStatus,
  createError: state.main.preCreateError,
  playingStatus: state.play.playingStatus,
  playingMode: state.play.playingMode,
  turnOnShufflePlay: state.play.turnOnShufflePlay,
  newArrRequest: state.play.newArrRequest,
  alertStatus: state.play.alertStatus,
  searchStatus: state.main.searchStatus,
  clearStatus: state.main.clearStatus,
  currArrRequest: state.play.currArrRequest,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      getTracks: actions.getTracksReq,
      prevPlaylistPage: actions.prevPlaylistPage,
      nextPlaylistPage: actions.nextPlaylistPage,
      deleteTrack: actions.deleteTrackReq,
      setTracksArr: actions.createUnsortedTracksArr,
      setSortRule: actions.setPlaylistBackendSortRule,
      setPlayingStatus: actions.setPlayingStatus,
      setTracksforSaga: actions.setTracksArrToConstantPlay,
      setTurnOnTracksPlay: actions.setTurnOnTracksPlay,
      setShowPlaylistTracks: actions.setShowPlaylistTracks,
      setOrderPlay: actions.setTrackOrderToPlay,
      nextTrackPage: actions.nextTrackPage,
      prevTrackPage: actions.prevTrackPage,
      setTurnOnShuffle: actions.setTurnOnShufflePlay,
      setTrackPlayState: actions.setPlayStateAction,
      setNewShuffleTracksArr: actions.setNewShuffleTracksPageArr,
      setSearchQuery: actions.setSearchQueryToSaga,
      updatePlaylist: actions.updatePlaylistList,
      setClearFalse: actions.clearSearchLine,
    },
    dispatch
  )

const GetPlaylists: React.FC<Props> = ({
  playlistsFromRedux,
  queryStatus,
  getTracks,
  prevPlaylistPage,
  nextPlaylistPage,
  currentPlaylistPage,
  pageLimitOverload,
  trackPageLimitOverload,
  deleteTrack,
  ownerId,
  userId,
  unsortedTracks,
  setTracksArr,
  setSortRule,
  playlistSortRule,
  setPlayingStatus,
  setTracksforSaga,
  setTurnOnTracksPlay,
  setShowPlaylistTracks,
  orderPlay,
  setOrderPlay,
  nextTrackPage,
  prevTrackPage,
  currentTrackPage,
  turnOnTracksPlay,
  playlistIdOld,
  setTurnOnShuffle,
  creationStatus,
  createError,
  playingStatus,
  playingMode,
  setTrackPlayState,
  turnOnShufflePlay,
  newArrRequest,
  setNewShuffleTracksArr,
  alertStatus,
  setSearchQuery,
  updatePlaylist,
  searchStatus,
  clearStatus,
  setClearFalse,
  currArrRequest,
}) => {
  const [showButton, setShowButton] = useState(true)
  const [showMessage, setShowMessage] = useState("")
  // const [isPlayDone, setIsPlayDone] = useState(false)
  const [maxTrackPages, setMaxTrackPages] = useState(4)
  const [minTracksOnPage, setMinTracksOnPage] = useState(4)
  const [playState, setPlayState] = useState(false)
  const [isSingleMode, setIsSingleMode] = useState(true)
  const [tracksPageNum, setTracksPageNum] = useState(0)
  const [searchValue, setSearchValue] = useState("")
  const songRefsArr: Array<HTMLDivElement> = useMemo(() => [], [])
  const btnArr: Array<HTMLButtonElement> = useMemo(() => [], [])
  let searchInputRef: React.MutableRefObject<HTMLInputElement | null> = React.useRef(
    null
  )
  let closeBtnRef: React.MutableRefObject<HTMLButtonElement | null> = React.useRef(
    null
  )
  let savedPlayState = useMemo(() => playState, [playState])
  let savedIsSingleMode = useMemo(() => isSingleMode, [isSingleMode])
  let savedPagesCount = useMemo(() => tracksPageNum, [tracksPageNum])

  console.log("currentTrackPage", currentTrackPage)

  const imgCarousel = () => {
    let arrImg = [
      img01,
      img02,
      img03,
      img04,
      img05,
      img06,
      img07,
      img08,
      img09,
      img10,
    ]
    let chosenImgIndex = Math.floor(Math.random() * 10) - 1
    return arrImg[chosenImgIndex > 0 ? chosenImgIndex : 0]
  }
  let nextImgToPlayer = imgCarousel()

  React.useEffect(() => {
    let searchInput: HTMLInputElement | null = searchInputRef.current

    const onKeyupHandler = (e: KeyboardEvent) => {
      if (e.keyCode === 13) {
        if (!(playingStatus || savedPlayState)) {
          setSearchQuery(new RegExp(searchValue))
        }
      }
    }

    const onInputHandler = (e: any) => {
      if (e.data === null) {
        if (!(playingStatus || savedPlayState)) {
          setSearchValue("")
        }
      }
      if (e.data !== "") {
        if (!(playingStatus || savedPlayState)) {
          updatePlaylist(e.data)
        }
      }
    }

    searchInput?.addEventListener("input", onInputHandler)
    window.addEventListener("keyup", onKeyupHandler)
    return () => {
      searchInput?.removeEventListener("input", onInputHandler)
      window.removeEventListener("keyup", onKeyupHandler)
    }
  })

  React.useEffect(() => {
    const getTracksPagesCount = () => localStorage.getItem("tracksPagesCount")
    const getTracksArrSize = () => localStorage.getItem("tracksArrSize")

    let pagesCount = getTracksPagesCount()
    if (pagesCount) {
      setTracksPageNum(+pagesCount)
    }

    if (unsortedTracks.length) {
      let playlistSize: number | null | undefined = Number(getTracksArrSize())
      if (playlistSize !== undefined && playlistSize !== null) {
        let maxPagesCount = Math.ceil(playlistSize / unsortedTracks.length)
        setMaxTrackPages(maxPagesCount)
        setMinTracksOnPage(unsortedTracks.length)
        setClearFalse(false)
      }
    }

    if (savedIsSingleMode) {
      if (playingStatus === "playing") {
        setPlayState(true)
      }
    } else {
      if (playingMode === "single") {
        setIsSingleMode(true)
      }
    }

    if (orderPlay === "inOrder" && turnOnTracksPlay) {
      setTracksforSaga(songRefsArr)
      setIsSingleMode(false)
    }
    if (orderPlay === "shuffle" && turnOnShufflePlay) {
      setTracksforSaga(songRefsArr)
      setIsSingleMode(false)
    }

    if (currArrRequest) {
      setNewShuffleTracksArr(songRefsArr)
    }
    if (newArrRequest === pagesCount) {
      setNewShuffleTracksArr(songRefsArr)
    }

    if (clearStatus) {
      setSearchValue("")
    }
  }, [
    orderPlay,
    setTracksforSaga,
    songRefsArr,
    turnOnTracksPlay,
    playingStatus,
    savedIsSingleMode,
    playingMode,
    turnOnShufflePlay,
    newArrRequest,
    setNewShuffleTracksArr,
    unsortedTracks,
    clearStatus,
    setClearFalse,
    currArrRequest,
  ])

  const SortableItemForPlaylist = SortableElement(
    ({
      track,
      i,
      buttonsArr,
      closeBtnRef,
      nextImg,
    }: {
      track: Track
      i: number
      buttonsArr: TrackResolver["buttonsArr"]
      closeBtnRef: TrackResolver["closeBtnRef"]
      nextImg: TrackResolver["nextImg"]
    }) => (
      <Row
        key={i}
        className={
          alertStatus ? "unselectable bg-white" : "mappedSong unselectable"
        }
      >
        {showButton && (
          <>
            <Col
              onClick={() => {
                if (savedIsSingleMode) {
                  setPlayingStatus("playing", undefined)
                } else {
                  if (playingStatus === "playing") {
                    setPlayState(true)
                  }
                }
                setShowMessage(track._id)
                setShowButton(false)
              }}
              className="d-flex trackItem"
              ref={(elem: HTMLDivElement) => (songRefsArr[i] = elem)}
            >
              <div className={alertStatus ? "text-white" : ""}>
                {track.originalFileName}
              </div>
            </Col>
            {ownerId === userId && !alertStatus ? (
              <Col
                onClick={() => deleteTrack(track._id)}
                className="deleteTrackPointer d-flex justify-content-end"
                style={{ width: "min-content", flexGrow: 0 }}
              >
                <div
                  aria-hidden="true"
                  className="deletePointer d-flex justify-content-center align-items-center pb-1"
                  style={{ width: "30px" }}
                >
                  ×
                </div>
              </Col>
            ) : null}
          </>
        )}

        {track._id === showMessage ? (
          <Col className="mt-3" style={{ paddingLeft: 0, minWidth: "570px" }}>
            <Alert
              variant="primary"
              dismissible
              onClose={() => {
                setShowMessage("")
                setShowButton(true)
                if (!savedIsSingleMode) {
                  setPlayState(false)
                  setPlayingStatus("closed", {
                    i,
                    arr: songRefsArr,
                    buttons:
                      buttonsArr["prevButton"] !== null &&
                      buttonsArr["nextButton"] !== null
                        ? {
                            prevButton: btnArr[0],
                            nextButton: btnArr[1],
                          }
                        : { prevButton: null, nextButton: null },
                    closeBtnRef,
                    playBtn: undefined,
                  })
                } else {
                  setPlayingStatus("", undefined)
                  setPlayState(false)
                }
              }}
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
                {track.id3?.trackNumber}
              </div>
              <Player
                src={track.url ? track.url : undefined}
                title={track.id3?.title ? track.id3?.title : undefined}
                originName={
                  track.originalFileName ? track.originalFileName : undefined
                }
                playState={savedPlayState}
                setShowButton={setShowButton}
                setShowMessage={setShowMessage}
                setPlayState={setPlayState}
                setIsSingleMode={setIsSingleMode}
                buttonsArr={{
                  prevButton: btnArr ? btnArr[0] : null,
                  nextButton: btnArr ? btnArr[1] : null,
                }}
                closeBtnRef={closeBtnRef}
                index={i}
                arr={songRefsArr}
                // isPlayDone={isPlayDone}
                isSingleMode={isSingleMode}
                nextImg={nextImg}
              />
              <Row>
                <Col
                  xs={6}
                  md={6}
                  lg={6}
                  className="justify-content-start d-flex"
                >
                  <Button
                    onClick={() => {
                      setShowMessage("")
                      setShowButton(true)
                      if (!savedIsSingleMode) {
                        setPlayState(false)
                        if (playingStatus === "playing") {
                          setPlayingStatus("closed", {
                            i,
                            arr: songRefsArr,
                            buttons:
                              buttonsArr["prevButton"] !== null &&
                              buttonsArr["nextButton"] !== null
                                ? {
                                    prevButton: btnArr[0],
                                    nextButton: btnArr[1],
                                  }
                                : { prevButton: null, nextButton: null },
                            closeBtnRef,
                            playBtn: undefined,
                          })
                        }

                        setShowPlaylistTracks(true)
                      } else {
                        setPlayingStatus("", undefined)
                        setPlayState(false)
                      }
                    }}
                    size="lg"
                    style={{ width: "100%" }}
                    className="playerCloseBtn mt-3"
                    ref={(elem: HTMLButtonElement | null) =>
                      elem ? (closeBtnRef.current = elem) : null
                    }
                  >
                    Close
                  </Button>
                </Col>
              </Row>
            </Alert>
          </Col>
        ) : null}
      </Row>
    )
  )

  const SortableItemForSingles = SortableElement(
    ({ track, i, nextImg }: { track: Track; i: number; nextImg: string }) => (
      <Row key={i} className="mappedSong flex-column unselectable">
        {showButton && (
          <Col
            onClick={() => {
              setPlayingStatus("playing", undefined)
              setShowMessage(track._id)
              setShowButton(false)
            }}
            className="d-flex flex-row justify-content-between align-items-center trackItem"
          >
            <div className="">{track.originalFileName}</div>
          </Col>
        )}

        {track._id === showMessage ? (
          <Col className="mt-3" style={{ paddingLeft: 0 }}>
            <Alert
              variant="primary"
              dismissible
              onClose={() => {
                setShowButton(true)
                setPlayingStatus("", undefined)
                setShowMessage("")
                setPlayState(false)
              }}
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
                {track.id3?.trackNumber}
              </div>
              <Player
                src={track.url ? track.url : undefined}
                title={track.id3?.title ? track.id3?.title : undefined}
                originName={
                  track.originalFileName ? track.originalFileName : undefined
                }
                playState={savedPlayState}
                setShowButton={setShowButton}
                setShowMessage={setShowMessage}
                nextImg={nextImg}
              />
              <Row>
                <Col
                  xs={6}
                  md={6}
                  lg={6}
                  className="justify-content-start d-flex"
                >
                  <Button
                    onClick={() => {
                      setShowButton(true)
                      setPlayingStatus("", undefined)
                      setShowMessage("")
                      setPlayState(false)
                    }}
                    size="lg"
                    style={{ width: "100%" }}
                    className="playerCloseBtn"
                  >
                    Close
                  </Button>
                </Col>
              </Row>
            </Alert>
          </Col>
        ) : null}
      </Row>
    )
  )

  const SortableList = SortableContainer(
    ({
      items,
      buttonsArr,
      closeBtnRef,
      nextImg,
    }: {
      items: Array<Track>
      buttonsArr: TrackResolver["buttonsArr"]
      closeBtnRef: TrackResolver["closeBtnRef"]
      nextImg: TrackResolver["nextImg"]
    }) => {
      return (
        <Container fluid className="flex-grow-1 d-flex flex-column">
          {items.map((track: Track, i: number) =>
            localStorage.getItem("playlistId") ? (
              <SortableItemForPlaylist
                key={`item-${i}`}
                index={i}
                i={i}
                track={track}
                buttonsArr={buttonsArr}
                closeBtnRef={closeBtnRef}
                nextImg={nextImg}
              />
            ) : (
              <SortableItemForSingles
                key={`item-${i}`}
                index={i}
                i={i}
                track={track}
                nextImg={nextImg}
              />
            )
          )}
        </Container>
      )
    }
  )

  const onSortEnd = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number
    newIndex: number
  }) => {
    setTracksArr(arrayMove(unsortedTracks, oldIndex, newIndex))
  }

  const MapPlaylistsQuery = ({
    queryStatus,
    playlistsFromRedux,
    getTracks,
  }: PlaylistResolver) => {
    if (!!createError) {
      return (
        <div>
          Sorry, an unexpected error occurred while creating the playlist! Try
          next time!
        </div>
      )
    }
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
      if (playlistsFromRedux.length) {
        return (
          <>
            {playlistsFromRedux.map((x: Playlist, i: number) => (
              <div
                key={i.toString()}
                onClick={
                  unsortedTracks.length &&
                  !(
                    !!playingStatus ||
                    savedPlayState ||
                    queryStatus === "tracks_pending"
                  )
                    ? () => getTracks(x._id)
                    : undefined
                }
                className={
                  unsortedTracks.length &&
                  !(
                    !!playingStatus ||
                    savedPlayState ||
                    queryStatus === "tracks_pending"
                  )
                    ? "mappedPlaylist unselectable"
                    : "mappedPlaylistDisabled unselectable"
                }
              >
                {x.name}
              </div>
            ))}
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
    unsortedTracks,
    buttonsArr,
    closeBtnRef,
    nextImg,
  }: TrackResolver) => {
    if (
      queryStatus === "playlists_succeed" ||
      queryStatus === "idle" ||
      queryStatus === "playlists_pending"
    ) {
      return <div>Tracks Search Data</div>
    }
    if (queryStatus === "tracks_pending") {
      if (!alertStatus) {
        return <Spinner animation="grow" />
      }
    }
    if (queryStatus === "tracks_succeed") {
      if (unsortedTracks.length) {
        return (
          <SortableList
            items={unsortedTracks}
            onSortEnd={onSortEnd}
            pressDelay={200}
            buttonsArr={buttonsArr}
            closeBtnRef={closeBtnRef}
            nextImg={nextImg}
          />
        )
      } else {
        return <div>Something wrong</div>
      }
    } else {
      return <div>No Data yet</div>
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
        <Col className="d-flex flex-row align-items-center">
          <Col
            className="d-flex justify-content-start"
            style={{ height: "min-content" }}
          >
            <Button
              disabled={
                !playlistsFromRedux.length ||
                !unsortedTracks.length ||
                currentPlaylistPage === 0 ||
                !!(playingStatus || savedPlayState) ||
                queryStatus === "playlists_pending" ||
                queryStatus === "tracks_pending"
              }
              onClick={prevPlaylistPage}
            >
              <div className="icon-arrow-left"></div>
            </Button>
          </Col>
          <div
            className="plyCol flex-grow-1 w-100"
            style={{ height: "min-content" }}
          >
            <MapPlaylistsQuery
              queryStatus={queryStatus}
              getTracks={getTracks}
              playlistsFromRedux={
                playlistsFromRedux.PlaylistFind
                  ? playlistsFromRedux.PlaylistFind
                  : playlistsFromRedux
              }
            />
          </div>
          <Col className="h-100">
            <Row className="h-100">
              <Col className="d-flex justify-content-center flex-column h-100">
                <ButtonGroup toggle className="d-flex flex-column">
                  <ToggleButton
                    className={
                      playlistSortRule === "1"
                        ? "icon-sort-alpha-asc rounded-pill btn-info font-weight-bold"
                        : "icon-sort-alpha-asc rounded-pill toggle-btn"
                    }
                    key={"btn1"}
                    type="radio"
                    name="radio"
                    value={"1"}
                    checked={playlistSortRule === "1"}
                    onChange={(e) => setSortRule(e.currentTarget.value)}
                    disabled={
                      creationStatus || !!searchStatus
                        ? true
                        : !playlistsFromRedux.length ||
                          !unsortedTracks.length ||
                          queryStatus === "playlists_pending" ||
                          !!(playingStatus || savedPlayState) ||
                          queryStatus === "tracks_pending"
                    }
                    style={{
                      color:
                        !!searchStatus ||
                        !playlistsFromRedux.length ||
                        !unsortedTracks.length ||
                        creationStatus ||
                        queryStatus === "playlists_pending" ||
                        !!(playingStatus || savedPlayState) ||
                        queryStatus === "tracks_pending"
                          ? "RGB(216,215,215)"
                          : playlistSortRule === "1"
                          ? "orange"
                          : "",
                      background:
                        !!searchStatus ||
                        !playlistsFromRedux.length ||
                        !unsortedTracks.length ||
                        creationStatus ||
                        queryStatus === "playlists_pending" ||
                        !!(playingStatus || savedPlayState) ||
                        queryStatus === "tracks_pending"
                          ? "RGB(153,165,165)"
                          : playlistSortRule === "1"
                          ? "RGB(23,162,184)"
                          : "RGB(0,123,255)",
                      border:
                        !!searchStatus ||
                        !playlistsFromRedux.length ||
                        !unsortedTracks.length ||
                        creationStatus ||
                        queryStatus === "playlists_pending" ||
                        !!(playingStatus || savedPlayState) ||
                        queryStatus === "tracks_pending"
                          ? "1px solid grey"
                          : playlistSortRule === "1"
                          ? "1px solid RGB(23,162,184)"
                          : "blue",
                    }}
                  ></ToggleButton>

                  <Button
                    disabled={
                      !(
                        playlistsFromRedux.PlaylistFind?.length ||
                        playlistsFromRedux.length
                      ) ||
                      !unsortedTracks.length ||
                      pageLimitOverload ||
                      queryStatus === "playlists_pending" ||
                      !!(playingStatus || savedPlayState) ||
                      queryStatus === "tracks_pending"
                    }
                    onClick={nextPlaylistPage}
                    className="my-4 rounded"
                  >
                    <div className="icon-arrow-right"></div>
                  </Button>

                  <ToggleButton
                    className={
                      playlistSortRule === "-1"
                        ? "rounded-pill icon-sort-alpha-desc btn-info font-weight-bold"
                        : "rounded-pill icon-sort-alpha-desc"
                    }
                    key={"btn2"}
                    type="radio"
                    name="radio"
                    value={"-1"}
                    checked={playlistSortRule === "-1"}
                    onChange={(e) => setSortRule(e.currentTarget.value)}
                    disabled={
                      creationStatus || !!searchStatus
                        ? true
                        : !playlistsFromRedux.length ||
                          !unsortedTracks.length ||
                          queryStatus === "playlists_pending" ||
                          !!(playingStatus || savedPlayState) ||
                          queryStatus === "tracks_pending"
                    }
                    style={{
                      color:
                        !!searchStatus ||
                        !playlistsFromRedux.length ||
                        !unsortedTracks.length ||
                        creationStatus ||
                        queryStatus === "playlists_pending" ||
                        !!(playingStatus || savedPlayState) ||
                        queryStatus === "tracks_pending"
                          ? "RGB(216,215,215)"
                          : playlistSortRule === "-1"
                          ? "orange"
                          : "",
                      background:
                        !!searchStatus ||
                        !playlistsFromRedux.length ||
                        !unsortedTracks.length ||
                        creationStatus ||
                        queryStatus === "playlists_pending" ||
                        !!(playingStatus || savedPlayState) ||
                        queryStatus === "tracks_pending"
                          ? "RGB(153,165,165)"
                          : playlistSortRule === "-1"
                          ? "RGB(23,162,184)"
                          : "RGB(0,123,255)",
                      border:
                        !!searchStatus ||
                        !playlistsFromRedux.length ||
                        !unsortedTracks.length ||
                        creationStatus ||
                        queryStatus === "playlists_pending" ||
                        !!(playingStatus || savedPlayState) ||
                        queryStatus === "tracks_pending"
                          ? "1px solid grey"
                          : playlistSortRule === "-1"
                          ? "1px solid RGB(23,162,184)"
                          : "1px solid blue",
                    }}
                  ></ToggleButton>
                </ButtonGroup>
              </Col>
            </Row>
          </Col>
        </Col>
        <Col className="d-flex flex-row justify-content-center">
          <div className="w-100 d-flex justify-content-start ml-5">
            <input
              disabled={
                !!(playingStatus || savedPlayState) ||
                queryStatus === "playlists_pending" ||
                queryStatus === "tracks_pending"
              }
              ref={searchInputRef}
              className="form-control col-xs-9 ml-4"
              id="searchPlaylist"
              name="searchPlaylist"
              type="search"
              value={searchValue}
              placeholder={
                playingStatus ||
                savedPlayState ||
                queryStatus === "playlists_pending" ||
                queryStatus === "tracks_pending"
                  ? ""
                  : "Enter playlist name. Use <Enter> to search..."
              }
              onChange={(e) => {
                if (!(playingStatus || savedPlayState)) {
                  setSearchValue(e.target.value)
                }
              }}
              style={{ width: "350px" }}
            />
          </div>
        </Col>
        <div className="px-3">
          <h2 className="forPlaylists bg-secondary rounded playCont text-white my-3">
            Tracks available
          </h2>
        </div>

        <Col className="d-flex flex-row align-items-center mb-3">
          <Col className="h-100">
            <Row className="h-100">
              <Col className="d-flex justify-content-center flex-column h-100">
                <ButtonGroup
                  toggle
                  className="d-flex flex-column align-items-end"
                >
                  <ToggleButton
                    className={
                      orderPlay === "inOrder" && turnOnTracksPlay
                        ? "rounded-pill icon-loop btn-warning text-danger font-weight-bold"
                        : "rounded-pill icon-loop track-toggle-btn btn-outline-warning"
                    }
                    key={"btn3"}
                    type="checkbox"
                    name="checkbox"
                    value={"inOrder"}
                    disabled={
                      creationStatus ||
                      !playlistIdOld ||
                      (savedPagesCount === 0 &&
                        minTracksOnPage < MIN_TRACKS_ON_PAGE) ||
                      (savedIsSingleMode && !!playingStatus) ||
                      savedPlayState ||
                      !unsortedTracks.length ||
                      queryStatus === "playlists_pending" ||
                      queryStatus === "tracks_pending"
                    }
                    style={{
                      color:
                        creationStatus ||
                        !playlistIdOld ||
                        (savedPagesCount === 0 &&
                          minTracksOnPage < MIN_TRACKS_ON_PAGE) ||
                        (savedIsSingleMode && !!playingStatus) ||
                        savedPlayState ||
                        !unsortedTracks.length ||
                        queryStatus === "playlists_pending" ||
                        queryStatus === "tracks_pending"
                          ? "gray"
                          : "",
                      pointerEvents:
                        creationStatus ||
                        !playlistIdOld ||
                        (savedPagesCount === 0 &&
                          minTracksOnPage < MIN_TRACKS_ON_PAGE) ||
                        (savedIsSingleMode && !!playingStatus) ||
                        savedPlayState ||
                        !unsortedTracks.length ||
                        queryStatus === "playlists_pending" ||
                        queryStatus === "tracks_pending"
                          ? "none"
                          : "auto",
                    }}
                    checked={
                      orderPlay === "inOrder" && turnOnTracksPlay ? true : false
                    }
                    onChange={(e) => {
                      // setIsSingleMode(false)
                      setOrderPlay(
                        e.currentTarget.checked ? e.currentTarget.value : ""
                      )
                      setTurnOnTracksPlay(
                        e.currentTarget.checked ? true : false
                      )
                      // setIsPlayDone(e.currentTarget.checked ? false : true)
                      if (e.currentTarget.checked) {
                        setTrackPlayState("true")
                      }
                    }}
                  ></ToggleButton>

                  <Button
                    disabled={
                      !unsortedTracks.length ||
                      currentTrackPage === 0 ||
                      queryStatus === "playlists_pending" ||
                      !!(playingStatus === "playing" || savedPlayState) ||
                      queryStatus === "tracks_pending"
                    }
                    onClick={() => prevTrackPage(currentTrackPage - 1)}
                    className="my-4 btn-danger rounded"
                    style={{ width: "min-content" }}
                    ref={(elem: HTMLButtonElement) => (btnArr[0] = elem)}
                  >
                    <div className="icon-arrow-left"></div>
                  </Button>

                  <ToggleButton
                    className={
                      orderPlay === "shuffle" && turnOnShufflePlay
                        ? "rounded-pill icon-shuffle btn-warning text-danger font-weight-bold"
                        : "rounded-pill icon-shuffle track-toggle-btn btn-outline-warning"
                    }
                    key={"btn4"}
                    type="checkbox"
                    name="checkbox"
                    value={"shuffle"}
                    disabled={
                      creationStatus ||
                      !playlistIdOld ||
                      (savedPagesCount === 0 &&
                        (maxTrackPages < MIN_TRACK_PAGES ||
                          maxTrackPages > MAX_TRACK_PAGES)) ||
                      (savedIsSingleMode && !!playingStatus) ||
                      savedPlayState ||
                      !unsortedTracks.length ||
                      queryStatus === "playlists_pending" ||
                      queryStatus === "tracks_pending"
                    }
                    style={{
                      color:
                        creationStatus ||
                        !playlistIdOld ||
                        (savedPagesCount === 0 &&
                          (maxTrackPages < MIN_TRACK_PAGES ||
                            maxTrackPages > MAX_TRACK_PAGES)) ||
                        (savedIsSingleMode && !!playingStatus) ||
                        savedPlayState ||
                        !unsortedTracks.length ||
                        queryStatus === "playlists_pending" ||
                        queryStatus === "tracks_pending"
                          ? "gray"
                          : "",
                      pointerEvents:
                        creationStatus ||
                        !playlistIdOld ||
                        (savedPagesCount === 0 &&
                          (maxTrackPages < MIN_TRACK_PAGES ||
                            maxTrackPages > MAX_TRACK_PAGES)) ||
                        (savedIsSingleMode && !!playingStatus) ||
                        savedPlayState ||
                        !unsortedTracks.length ||
                        queryStatus === "playlists_pending" ||
                        queryStatus === "tracks_pending"
                          ? "none"
                          : "auto",
                    }}
                    checked={
                      orderPlay === "shuffle" && turnOnShufflePlay
                        ? true
                        : false
                    }
                    onChange={(e) => {
                      setOrderPlay(
                        e.currentTarget.checked ? e.currentTarget.value : ""
                      )
                      setTurnOnShuffle(e.currentTarget.checked ? true : false)
                      // setIsPlayDone(e.currentTarget.checked ? false : true)
                      if (e.currentTarget.checked) {
                        setTrackPlayState("true")
                      }
                    }}
                  ></ToggleButton>
                </ButtonGroup>
              </Col>
            </Row>
          </Col>
          <div className="plyCol flex-grow-1 w-100 tracksCont">
            {alertStatus ? (
              <div className="alertDeleteWaiting d-flex align-items-center justify-content-center">
                <Spinner
                  as="span"
                  animation="grow"
                  role="status"
                  aria-hidden="true"
                />
                <span className="pl-3 text-primary">Wait until delete...</span>
              </div>
            ) : null}
            <MapTracksQuery
              queryStatus={queryStatus}
              unsortedTracks={unsortedTracks}
              nextImg={nextImgToPlayer}
              buttonsArr={{
                prevButton: btnArr ? btnArr[0] : null,
                nextButton: btnArr ? btnArr[1] : null,
              }}
              closeBtnRef={closeBtnRef}
            />
          </div>
          <Col
            className="d-flex justify-content-start"
            style={{ height: "min-content" }}
          >
            <Button
              disabled={
                !unsortedTracks.length ||
                trackPageLimitOverload ||
                queryStatus === "playlists_pending" ||
                !!(playingStatus === "playing" || savedPlayState) ||
                queryStatus === "tracks_pending"
              }
              onClick={() => nextTrackPage(currentTrackPage + 1)}
              className="btn-danger rounded"
              ref={(elem: HTMLButtonElement) => (btnArr[1] = elem)}
            >
              <div className="icon-arrow-right"></div>
            </Button>
          </Col>
        </Col>
      </Row>
    </>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(GetPlaylists))
