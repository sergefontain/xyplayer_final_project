import { SagaIterator } from "redux-saga"
import { call, put, take } from "redux-saga/effects"
import * as actions from "../actions"
import { myFetch } from "../apiClient"
import { ENDPOINT_UPLOAD } from "./../../store/apiClient"

const getToken = () => localStorage.getItem("token")
const getPlaylistId = () => localStorage.getItem("playlistId")
const getTracksTrueStatus = () => localStorage.getItem("setTracksTrue")
const getPlaylistPageLength = () => localStorage.getItem("playlistPageLength")
const checkLimitOverLoad = () => localStorage.getItem("limitOverloaded")

const allTracks = async (acceptedFiles: Array<any>) => {
  return await Promise.all(
    acceptedFiles.map(async (file: string | Blob) => {
      const body = new FormData()
      body.append("track", file)
      let response = await fetch(`${ENDPOINT_UPLOAD}`, {
        method: "POST",
        headers: localStorage.token
          ? { Authorization: "Bearer " + localStorage.token }
          : {},
        body: body,
      })
      let res = await response.json()
      return res
    })
  )
}

const infoPreparingToServer = (arr: Array<any>) => {
  for (let obj of arr) {
    for (let key in obj) {
      if (key === "url") {
        delete obj[key]
      }
    }
  }
  return arr
}

const infoPreparingToReUpload = (arr: Array<any>) => {
  for (let obj of arr) {
    for (let key in obj) {
      if (key === "originalFileName") {
        delete obj[key]
      }
      if (key === "url") {
        delete obj[key]
      }
      if (key === "id3") {
        delete obj[key]
      }
    }
  }
  return arr
}

const preparingTracksArrToDeleteOne = (
  trackIdToDelete: string,
  tracksArr: Array<any>
) => {
  const index = tracksArr.findIndex((x) => x._id === trackIdToDelete)
  if (index !== -1) {
    tracksArr.splice(index, 1)
  }

  return tracksArr
}

const PAGE_LIMIT = 20

const queryPlaylists = `
query findPlaylists($query: String!){
    PlaylistFind(query:$query){
    name
    _id
    tracks{
      _id
      originalFileName
    }
  }
}
`
const testQueryPlaylists = `
query findPlaylists{
    PlaylistFind(query:"[{}]"){
    name
    _id
    tracks{
      _id
      originalFileName
    }
  }
}
`

const queryTracks = `
query allTracks($query: String!){
    TrackFind(query: $query){
      url
      _id
      originalFileName
      id3{
        title
        album
        artist
        year
        genre
        trackNumber
      }
  }
}
`

const queryPlaylistOne = `
query playlistOne($query: String!){
  PlaylistFindOne(query: $query){
    _id
    name
    tracks{
      _id
      originalFileName
      url
      id3{
        title
        album
        artist
        year
        genre
        trackNumber
      }
    }
  }
}
`

const createPlaylist = `
mutation addPlaylist($playlist: PlaylistInput!){
  PlaylistUpsert(playlist: $playlist){
    name
    description
    tracks{
      _id
    }
  }
}
`

const deleteTrack = `
mutation deleteTrack($playlist: PlaylistInput!){
  PlaylistUpsert(playlist: $playlist){
    _id
    tracks{
      _id
    }
  }
}
`

export function* getPlaylistsSaga(): SagaIterator {
  while (true) {
    console.log("start getPlaylistsSaga")
    try {
      yield take(actions.authSuccess)
      const authData = yield call(getToken)
      yield put(actions.getPlaylistsReq())
      console.log("getPlaylistsReq()")
      const allPlaylists = yield call(
        myFetch,
        testQueryPlaylists,
        {},
        { headers: { Authorization: `Bearer ${authData}` } }
      )

      yield put(actions.setPlaylistPageLength(allPlaylists.PlaylistFind.length))
      localStorage.setItem(
        "playlistPageLength",
        `${allPlaylists.PlaylistFind.length}`
      )
      yield put(actions.setPageLimit(PAGE_LIMIT))
      const limitedPlaylists = yield call(
        myFetch,
        queryPlaylists,
        {
          query: JSON.stringify([
            {},
            {
              // sort: [{ _id: -1 }],
              // skip: [10],
              limit: [PAGE_LIMIT],
            },
          ]),
        },
        { headers: { Authorization: `Bearer ${authData}` } }
      )
      yield put(actions.getPlaylistsOk(limitedPlaylists))
    } catch (e) {
      yield put(actions.getPlaylistsTracksFail(e))
      throw new Error(`ВСЕ ПРОПАЛО! ${e}`)
    }
  }
}

export function* getTracksSaga(): SagaIterator {
  while (true) {
    console.log("start getTracksSaga")
    const playlistIdOld = yield call(getPlaylistId)
    const tracksTrueStatus = yield call(getTracksTrueStatus)

    try {
      if (tracksTrueStatus === "ok") {
        console.log("tracksTrueStatus ОК")
        const authData = yield call(getToken)
        const { payload: playlistId } = yield take(actions.getTracksReq)
        localStorage.setItem("playlistId", playlistId)
        yield put(actions.getTracksReq(""))
        const searchQuery = `${playlistId}`
        const playlistOne = yield call(
          myFetch,
          queryPlaylistOne,
          {
            query: JSON.stringify([
              {
                _id: searchQuery,
              },
            ]),
          },
          { headers: { Authorization: `Bearer ${authData}` } }
        )
        yield put(actions.getTracksOk(playlistOne))
        continue
      }
      if (playlistIdOld) {
        console.log("начат блок кода, когда есть playlistIdOld")
        yield take(actions.getPlaylistsOk)
        yield put(actions.getTracksReq(""))
        const searchQueryOld = `${playlistIdOld}`
        const authData = yield call(getToken)
        const playlistOneOld = yield call(
          myFetch,
          queryPlaylistOne,
          {
            query: JSON.stringify([
              {
                _id: searchQueryOld,
              },
            ]),
          },
          { headers: { Authorization: `Bearer ${authData}` } }
        )
        yield put(actions.getTracksOk(playlistOneOld))
        localStorage.setItem("setTracksTrue", "ok")
      }
      console.log("начальная загрузка треков после логина окончена")

      // начальная загрузка треков после логина
      yield take(actions.getPlaylistsOk)
      const authData = yield call(getToken)
      yield put(actions.getTracksReq(""))
      const tracks = yield call(
        myFetch,
        queryTracks,
        {
          query: JSON.stringify([
            {},
            {
              limit: [PAGE_LIMIT],
            },
          ]),
        },
        { headers: { Authorization: `Bearer ${authData}` } }
      )
      console.log("начат блок кода, когда нету playlistIdOld")
      yield put(actions.getTracksOk(tracks))

      // загрузка треков по запросу
      console.log("ожидание загрузки треков по запросу")
      const { payload: playlistId } = yield take(actions.getTracksReq)
      localStorage.setItem("playlistId", playlistId)
      yield put(actions.getTracksReq(""))
      const searchQuery = `${playlistId}`
      const playlistOne = yield call(
        myFetch,
        queryPlaylistOne,
        {
          query: JSON.stringify([
            {
              _id: searchQuery,
            },
          ]),
        },
        { headers: { Authorization: `Bearer ${authData}` } }
      )
      yield put(actions.getTracksOk(playlistOne))
      localStorage.setItem("setTracksTrue", "ok")
    } catch (e) {
      yield put(actions.getPlaylistsTracksFail(e))
      throw new Error(`ВСЕ ПРОПАЛО! ${e}`)
    }
  }
}

let i = 0
let j = 0
let pageNum = 1
export function* getPrevPlaylistPageSaga(): SagaIterator {
  while (true) {
    let prevPlaylistQuery = 0
    yield take(actions.prevPlaylistPage)
    i = i - PAGE_LIMIT
    const authData = yield call(getToken)
    prevPlaylistQuery = i
    yield put(actions.getPlaylistsReq())
    console.log("getPlaylistsReq() prev")
    try {
      const limitedPlaylists = yield call(
        myFetch,
        queryPlaylists,
        {
          query: JSON.stringify([
            {},
            {
              // sort: [{ _id: -1 }],
              skip: [prevPlaylistQuery],
              limit: [PAGE_LIMIT],
            },
          ]),
        },
        { headers: { Authorization: `Bearer ${authData}` } }
      )

      yield put(actions.getPlaylistsOk(limitedPlaylists))
      pageNum = pageNum - 1
      yield put(actions.prevPlaylistPage(`${pageNum}`))
      j = j - PAGE_LIMIT - 1
      yield put(actions.setSkippedPlaylistsData(j))
      if (j < PAGE_LIMIT - 1) {
        yield put(actions.prevPlaylistPage("1"))
      }
      const checkTrue = yield call(checkLimitOverLoad)
      if (checkTrue) {
        yield put(actions.setLimitOverloaded(false))
        localStorage.removeItem("limitOverloaded")
      }
    } catch (e) {
      yield put(actions.getPlaylistsTracksFail(e))
      throw new Error(`ВСЕ ПРОПАЛО! ${e}`)
    }
  }
}

export function* getNextPlaylistPageSaga(): SagaIterator {
  while (true) {
    let nextPlaylistQuery = 0
    yield take(actions.nextPlaylistPage)
    i = i + PAGE_LIMIT
    const authData = yield call(getToken)
    nextPlaylistQuery = i

    yield put(actions.getPlaylistsReq())
    console.log("getPlaylistsReq() next")
    try {
      const limitedPlaylists = yield call(
        myFetch,
        queryPlaylists,
        {
          query: JSON.stringify([
            {},
            {
              // sort: [{ _id: -1 }],
              skip: [nextPlaylistQuery],
              limit: [PAGE_LIMIT],
            },
          ]),
        },
        { headers: { Authorization: `Bearer ${authData}` } }
      )

      yield put(actions.getPlaylistsOk(limitedPlaylists))
      pageNum = pageNum + 1
      yield put(actions.nextPlaylistPage(`${pageNum}`))
      j = j + PAGE_LIMIT - 1
      yield put(actions.setSkippedPlaylistsData(j))
      const playlistLength = yield call(getPlaylistPageLength)
      if (pageNum * (PAGE_LIMIT - 1) > playlistLength) {
        yield put(actions.setLimitOverloaded(true))
        j = +playlistLength
        localStorage.setItem("limitOverloaded", "yes")
      }
    } catch (e) {
      yield put(actions.getPlaylistsTracksFail(e))
      throw new Error(`ВСЕ ПРОПАЛО! ${e}`)
    }
  }
}

export function* createPlaylistSaga(): SagaIterator {
  while (true) {
    try {
      const { payload: data } = yield take(actions.createPlaylistReq)
      const tracksServerInfo = yield call(allTracks, data.files)
      const res = yield call(infoPreparingToServer, tracksServerInfo)
      const authData = yield call(getToken)
      yield call(
        myFetch,
        createPlaylist,
        {
          playlist: {
            name: data.name,
            description: data.description,
            tracks: res,
          },
        },
        { headers: { Authorization: `Bearer ${authData}` } }
      )
      yield put(actions.createPlaylistSuccess())
      yield put(actions.getPlaylistsReq())
      yield put(actions.setPageLimit(PAGE_LIMIT))
      const limitedPlaylists = yield call(
        myFetch,
        queryPlaylists,
        {
          query: JSON.stringify([
            {},
            {
              // sort: [{ _id: -1 }],
              // skip: [10],
              limit: [PAGE_LIMIT],
            },
          ]),
        },
        { headers: { Authorization: `Bearer ${authData}` } }
      )
      yield put(actions.getPlaylistsOk(limitedPlaylists))
    } catch (e) {
      yield put(actions.createPlaylistFailure(e))
      throw new Error(`Playlist creation rejected: ${e}`)
    }
  }
}

export function* deleteTrackSaga(): SagaIterator {
  while (true) {
    try {
      const { payload: trackIdToDelete } = yield take(actions.deleteTrackReq)
      const authData = yield call(getToken)
      const playlistId = yield call(getPlaylistId)
      const searchQuery = `${playlistId}`
      const playlistOne = yield call(
        myFetch,
        queryPlaylistOne,
        {
          query: JSON.stringify([
            {
              _id: searchQuery,
            },
          ]),
        },
        { headers: { Authorization: `Bearer ${authData}` } }
      )
      const res = yield call(
        preparingTracksArrToDeleteOne,
        trackIdToDelete,
        playlistOne.PlaylistFindOne.tracks
      )
      const TracksArrIdToReupload = yield call(infoPreparingToReUpload, res)
      const yes = yield call(
        myFetch,
        deleteTrack,
        {
          playlist: { _id: playlistId, tracks: TracksArrIdToReupload },
        },
        { headers: { Authorization: `Bearer ${authData}` } }
      )
      console.log(yes)

      const searchQuery2 = `${yes.PlaylistUpsert._id}`
      const modifiedPlaylist = yield call(
        myFetch,
        queryPlaylistOne,
        {
          query: JSON.stringify([
            {
              _id: searchQuery2,
            },
          ]),
        },
        { headers: { Authorization: `Bearer ${authData}` } }
      )
      yield put(actions.getTracksOk(modifiedPlaylist))
      yield put(actions.deleteTrackSuccess())
    } catch (e) {
      yield put(actions.deleteTrackFailure())
      throw new Error(`delete track rejected: ${e}`)
    }
  }
}
