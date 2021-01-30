import { SagaIterator } from "redux-saga"
import { call, delay, put, take } from "redux-saga/effects"
import * as actions from "../actions"
import { myFetch } from "../apiClient"
import { ENDPOINT_UPLOAD } from "./../../store/apiClient"
import jwt_decode from "jwt-decode"
import { Playlist, Track } from "./types"

let queryMaxSize = 3
const PAGE_LIMIT_PLAYLIST = 3
let startTracksMaxSize = 3
const PAGE_LIMIT_TRACK = 6

const TRACKS_START_LIMIT = startTracksMaxSize * PAGE_LIMIT_TRACK
const QUERY_PLAYLIST_LIMIT = PAGE_LIMIT_PLAYLIST * queryMaxSize

let playlistsPageArr: Array<Playlist[]> = []
let playlistsQueriesArr: Array<Playlist[]> = []
let fullLengthPlaylistsFilteredArr: Array<Array<Playlist[]>> = []
let pagesCount = 0
let queryNum = 0
let playlistsSortRule = 1
let savedPlaylistSortRule = playlistsSortRule
let trackPagesCount = 0
let tracksPageArr: Array<Track[]> = []
let fullLengthTracksArr: Array<Track> = []
let tracksArrSize = 0
let searchEnd = false
let maxSearchPagesCount = 0
let createdPlaylistId = ""
let playlistOld = ""

interface User {
  acl: Array<any>
  id: string
  login: string
}

interface UserInfo {
  iat: number
  sub: User
}

/*
 ** Service functions
 */
const getToken = () => localStorage.getItem("token")
const getPlaylistId = () => localStorage.getItem("playlistId")
const getTracksTrueStatus = () => localStorage.getItem("setTracksTrue")
const getPlaylistParticleLength = () =>
  localStorage.getItem("playlistParticleLength")
const getPlaylistModifiedLength = () =>
  localStorage.getItem("playlistModifiedLength")
const getPlaylistCommonLength = () =>
  localStorage.getItem("playlistCommonLength")
const checkLimitOverLoad = () => localStorage.getItem("limitOverloaded")
const checkPlaylistCreated = () => localStorage.getItem("playlistCreated")
const checkTrackPageLimitOverload = () =>
  localStorage.getItem("trackPageLimitOverload")

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

const tracksPreparingToUpload = (arr: Array<any>) => {
  let tracksArrToUpload = []
  for (let obj of arr) {
    for (let key in obj) {
      if (key === "fileObject") {
        tracksArrToUpload.push(obj[key])
      }
    }
  }
  return tracksArrToUpload
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
  tracksArr: Array<Track>
) => {
  const index = tracksArr.findIndex((x) => x._id === trackIdToDelete)
  if (index !== -1) {
    tracksArr.splice(index, 1)
  }
  return tracksArr
}

const preparingPlaylistsArrToPagination = (playlistsArr: Array<Playlist>) => {
  let indexArr: number[] = []

  playlistsArr.map((obj, i) => {
    if (Boolean(obj.name) === false) {
      indexArr.push(i)
    }
    return indexArr
  })

  let difference = playlistsArr.filter((obj, i) => {
    if (i >= indexArr[0] && i <= indexArr[indexArr.length - 1]) {
      return false
    } else return obj
  })

  const filteredTracksNull = difference.filter((x) => !x.tracks === false)
  const filteredTracksNullLength = filteredTracksNull.filter(
    (x) => x.tracks.length !== 0
  )

  localStorage.setItem(
    "playlistModifiedLength",
    `${filteredTracksNullLength.length}`
  )

  if (playlistsSortRule === 1) {
    filteredTracksNullLength.sort((a, b) =>
      a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    )
  } else {
    filteredTracksNullLength.sort((a, b) =>
      a.name.toLowerCase() < b.name.toLowerCase() ? 1 : -1
    )
  }

  const limitedArr = filteredTracksNullLength.slice(0, PAGE_LIMIT_PLAYLIST)
  return { arr: filteredTracksNullLength, limitedArr: limitedArr }
}

const applyPlaylistSortRule = (playlistArr: Array<Playlist>) => {
  if (playlistsSortRule === 1) {
    playlistArr.sort((a, b) =>
      a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    )
  } else {
    playlistArr.sort((a, b) =>
      a.name.toLowerCase() < b.name.toLowerCase() ? 1 : -1
    )
  }
}

const preparingTracksArrToFront = (tracksArr: Array<Track>) => {
  return Object.values(
    tracksArr.reduce(
      (sum, currentItem) =>
        Object.assign(sum, { [currentItem.originalFileName]: currentItem }),
      {}
    )
  )
}

const checkArrIncludesNextSlice = (
  arr: Playlist[][][],
  nextItem: Playlist[]
) => {
  let result = false
  arr.forEach((x: Playlist[][]) => {
    for (let z of x) {
      let res = z.findIndex((obj: Playlist) => obj._id === nextItem[0]._id)
      if (res !== -1) {
        result = true
      }
    }
  })
  return result
}

/*
 ** Service queries
 */

const queryPlaylists = `
query findPlaylists($query: String!){
    PlaylistFind(query:$query){
    name
    _id
    owner{
      _id
    }
    tracks{
      _id
      originalFileName
    }
  }
}
`

const queryPlaylistsCount = `
query findPlaylists($query: String!){
    PlaylistCount(query:$query)
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
    owner{
      _id
    }
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
    owner{
      _id
    }
    tracks{
      _id
    }
  }
}
`

/*
 ** Main Sagas
 */

export function* getPlaylistsSaga(): SagaIterator {
  while (true) {
    yield take(actions.authSuccess)

    try {
      const authData = yield call(getToken)

      const decoded: UserInfo = jwt_decode(authData)
      yield put(actions.getUserId(decoded.sub.id))

      yield put(actions.getPlaylistsReq())
      const allPlaylists = yield call(
        myFetch,
        queryPlaylistsCount,
        {
          query: JSON.stringify([
            {
              name: { $nin: [null, ""] },
              "tracks.0": { $exists: true },
            },
            {},
          ]),
        },
        { headers: { Authorization: `Bearer ${authData}` } }
      )

      yield put(actions.setPlaylistPageLength(allPlaylists.PlaylistCount))
      localStorage.setItem(
        "playlistCommonLength",
        `${allPlaylists.PlaylistCount}`
      )

      const dowloadedPlaylists = yield call(
        myFetch,
        queryPlaylists,
        {
          query: JSON.stringify([
            {
              name: { $nin: [null, ""] },
              "tracks.0": { $exists: true },
            },
            {
              sort: [{ name: playlistsSortRule }],
              skip: [0],
              limit: [QUERY_PLAYLIST_LIMIT],
            },
          ]),
        },
        { headers: { Authorization: `Bearer ${authData}` } }
      )

      const { arr, limitedArr: arrToFront } = yield call(
        preparingPlaylistsArrToPagination,
        dowloadedPlaylists.PlaylistFind
      )
      maxSearchPagesCount = 0

      savedPlaylistSortRule = playlistsSortRule
      fullLengthPlaylistsFilteredArr = []
      queryNum = 0
      playlistsQueriesArr = []
      playlistsQueriesArr.push(arr)

      pagesCount = 0
      yield put(actions.setPlaylistPage(0))
      playlistsPageArr = []
      playlistsPageArr[pagesCount] = arrToFront
      fullLengthPlaylistsFilteredArr[queryNum] = playlistsPageArr

      const playlistModifiedLength = yield call(getPlaylistModifiedLength)

      if (PAGE_LIMIT_PLAYLIST < playlistModifiedLength) {
        yield put(actions.getPlaylistsOk(arrToFront))
      } else {
        yield put(actions.getPlaylistsOk(arrToFront))
        localStorage.setItem("limitOverloaded", "yes")
        yield put(actions.setLimitOverloaded(true))
      }
    } catch (e) {
      yield put(actions.getPlaylistsTracksFail(e))
      throw new Error(`ВСЕ ПРОПАЛО! ${e}`)
    }
  }
}

export function* getTracksSaga(): SagaIterator {
  while (true) {
    const playlistIdOld = yield call(getPlaylistId)
    yield put(actions.getPlaylistIdOld(playlistIdOld))
    const tracksTrueStatus = yield call(getTracksTrueStatus)
    const createTrue = yield call(checkPlaylistCreated)

    try {
      if (tracksTrueStatus === "ok") {
        // основной блок для загрузки треков по запросу

        if (tracksPageArr.length === 0) {
          console.log("+")

          yield take(actions.getPlaylistsOk)
          const authData = yield call(getToken)
          yield put(actions.getTracksReq(""))
          const searchQueryOld = `${playlistIdOld}`
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
          const modifiedArrToFront = yield call(
            preparingTracksArrToFront,
            playlistOneOld.PlaylistFindOne.tracks
          )
          fullLengthTracksArr = modifiedArrToFront
          tracksArrSize = modifiedArrToFront.length
          localStorage.setItem("tracksArrSize", `${tracksArrSize}`)
          const limitedTracksArr = modifiedArrToFront.slice(0, PAGE_LIMIT_TRACK)
          trackPagesCount = 0
          localStorage.setItem("tracksPagesCount", `${trackPagesCount}`)
          tracksPageArr = []
          yield put(actions.setTrackPage(0))
          tracksPageArr.push(limitedTracksArr)

          if (PAGE_LIMIT_TRACK >= tracksArrSize) {
            localStorage.setItem("trackPageLimitOverload", "yes")
            yield put(actions.setTrackPageLimitOverloaded(true))
          }

          yield put(actions.createUnsortedTracksArr(limitedTracksArr))
          yield put(actions.getTracksOk())
          console.log("-")
          continue
        }
        console.log("+++")

        const { payload: playlistId } = yield take(actions.getTracksReq)

        if (!createTrue) {
          localStorage.setItem("playlistId", `${playlistId}`)
        }
        // console.log("createdPlaylistId, playlistId, playlistOld", createdPlaylistId, playlistId, playlistOld)
        if (createdPlaylistId !== playlistId && createdPlaylistId) {
          if (!searchEnd) {
            yield put(actions.setCreatePlaylistStatus(false))
            createdPlaylistId = ""
            playlistOld = ""
          } else {
            if (playlistOld !== playlistId && playlistOld) {
              yield put(actions.setCreatePlaylistStatus(false))
              createdPlaylistId = ""
              playlistOld = ""
            }
          }
        }

        const authData = yield call(getToken)
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
        yield put(
          actions.getPlaylistOwnerId(playlistOne.PlaylistFindOne.owner._id)
        )
        const modifiedArrToFront = yield call(
          preparingTracksArrToFront,
          playlistOne.PlaylistFindOne.tracks
        )

        fullLengthTracksArr = modifiedArrToFront
        tracksArrSize = modifiedArrToFront.length
        localStorage.setItem("tracksArrSize", `${tracksArrSize}`)
        const limitedTracksArr = modifiedArrToFront.slice(0, PAGE_LIMIT_TRACK)
        trackPagesCount = 0
        localStorage.setItem("tracksPagesCount", `${trackPagesCount}`)
        tracksPageArr = []
        yield put(actions.setTrackPage(0))
        tracksPageArr.push(limitedTracksArr)

        const checkTrue = yield call(checkTrackPageLimitOverload)
        if (checkTrue) {
          yield put(actions.setTrackPageLimitOverloaded(false))
          localStorage.removeItem("trackPageLimitOverload")
        }

        if (PAGE_LIMIT_TRACK >= tracksArrSize) {
          localStorage.setItem("trackPageLimitOverload", "yes")
          yield put(actions.setTrackPageLimitOverloaded(true))
        }

        yield put(actions.createUnsortedTracksArr(limitedTracksArr))
        yield put(actions.getTracksOk())
        localStorage.setItem("setTracksTrue", "ok")
        console.log("---")
        continue
      }

      if (playlistIdOld && !tracksTrueStatus) {
        // первичная загрузка треков прослушанного плейлиста после логина
        console.log(
          "первичная загрузка треков прослушанного плейлиста после логина"
        )
        yield take(actions.getPlaylistsOk)
        const authData = yield call(getToken)
        yield put(actions.getTracksReq(""))
        const searchQueryOld = `${playlistIdOld}`
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
        const modifiedArrToFront = yield call(
          preparingTracksArrToFront,
          playlistOneOld.PlaylistFindOne.tracks
        )

        fullLengthTracksArr = modifiedArrToFront
        tracksArrSize = modifiedArrToFront.length
        localStorage.setItem("tracksArrSize", `${tracksArrSize}`)
        const limitedTracksArr = modifiedArrToFront.slice(0, PAGE_LIMIT_TRACK)
        trackPagesCount = 0
        localStorage.setItem("tracksPagesCount", `${trackPagesCount}`)
        tracksPageArr = []
        yield put(actions.setTrackPage(0))
        tracksPageArr.push(limitedTracksArr)

        if (PAGE_LIMIT_TRACK >= tracksArrSize) {
          localStorage.setItem("trackPageLimitOverload", "yes")
          yield put(actions.setTrackPageLimitOverloaded(true))
        }

        yield put(actions.createUnsortedTracksArr(limitedTracksArr))
        yield put(actions.getTracksOk())
        localStorage.setItem("setTracksTrue", "ok")
        continue
      } else {
        // первичная загрузка треков после логина
        console.log("первичная загрузка треков после логина")
        yield take(actions.getPlaylistsOk)
        const authData = yield call(getToken)
        const checkTracksOverloadTrue = yield call(checkTrackPageLimitOverload)
        console.log("checkTracksOverloadTrue",checkTracksOverloadTrue)
        if (checkTracksOverloadTrue) {
          yield put(actions.setTrackPageLimitOverloaded(false))
          localStorage.removeItem("trackPageLimitOverload")
        }
        yield put(actions.getTracksReq(""))
        const tracks = yield call(
          myFetch,
          queryTracks,
          {
            query: JSON.stringify([
              {},
              {
                sort: [{ _id: -1 }],
                limit: [TRACKS_START_LIMIT],
              },
            ]),
          },
          { headers: { Authorization: `Bearer ${authData}` } }
        )
        const modifiedArrToFront = yield call(
          preparingTracksArrToFront,
          tracks.TrackFind
        )

        fullLengthTracksArr = modifiedArrToFront
        tracksArrSize = modifiedArrToFront.length
        localStorage.setItem("tracksArrSize", `${tracksArrSize}`)
        const limitedTracksArr = modifiedArrToFront.slice(0, PAGE_LIMIT_TRACK)
        trackPagesCount = 0
        localStorage.setItem("tracksPagesCount", `${trackPagesCount}`)
        tracksPageArr = []
        yield put(actions.setTrackPage(0))
        tracksPageArr.push(limitedTracksArr)


        if (PAGE_LIMIT_TRACK >= tracksArrSize) {
          localStorage.setItem("trackPageLimitOverload", "yes")
          yield put(actions.setTrackPageLimitOverloaded(true))
        }

        yield put(actions.createUnsortedTracksArr(limitedTracksArr))
        yield put(actions.getTracksOk())

        // первичная загрузка треков по запросу
        const { payload: playlistId } = yield take(actions.getTracksReq)

        localStorage.setItem("playlistId", `${playlistId}`)

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
        yield put(
          actions.getPlaylistOwnerId(playlistOne.PlaylistFindOne.owner._id)
        )

        const modifiedTracksArrToFront = yield call(
          preparingTracksArrToFront,
          playlistOne.PlaylistFindOne.tracks
        )

        fullLengthTracksArr = modifiedTracksArrToFront
        tracksArrSize = modifiedTracksArrToFront.length
        localStorage.setItem("tracksArrSize", `${tracksArrSize}`)
        const limitedTracksArr2 = modifiedTracksArrToFront.slice(
          0,
          PAGE_LIMIT_TRACK
        )
        trackPagesCount = 0
        localStorage.setItem("tracksPagesCount", `${trackPagesCount}`)
        tracksPageArr = []
        yield put(actions.setTrackPage(0))
        tracksPageArr.push(limitedTracksArr2)

        if (PAGE_LIMIT_TRACK >= tracksArrSize) {
          localStorage.setItem("trackPageLimitOverload", "yes")
          yield put(actions.setTrackPageLimitOverloaded(true))
        }

        yield put(actions.createUnsortedTracksArr(limitedTracksArr2))
        yield put(actions.getTracksOk())
        localStorage.setItem("setTracksTrue", "ok")
      }
    } catch (e) {
      yield put(actions.getPlaylistsTracksFail(e))
      throw new Error(`ВСЕ ПРОПАЛО! ${e}`)
    }
  }
}

export function* getPrevPlaylistPageSaga(): SagaIterator {
  while (true) {
    try {
      yield take(actions.prevPlaylistPage)
      if (searchEnd) {
        pagesCount = pagesCount - 1
        maxSearchPagesCount = maxSearchPagesCount + 1

        yield put(actions.prevPlaylistPage())
        yield put(actions.getPlaylistsReq())

        const checkTrue = yield call(checkLimitOverLoad)
        if (checkTrue) {
          yield put(actions.setLimitOverloaded(false))
          localStorage.removeItem("limitOverloaded")
        }
        yield call(
          applyPlaylistSortRule,
          fullLengthPlaylistsFilteredArr[queryNum][pagesCount]
        )
        yield put(
          actions.getPlaylistsOk(
            fullLengthPlaylistsFilteredArr[queryNum][pagesCount]
          )
        )

        yield put(
          actions.createUnsortedTracksArr(tracksPageArr[trackPagesCount])
        )
        yield put(actions.getTracksOk())
      } else {
        if (pagesCount === 0 && queryNum !== 0) {
          queryNum = queryNum - 1
          pagesCount = queryMaxSize - 1

          yield put(actions.prevPlaylistPage())
          yield put(actions.getPlaylistsReq())

          const checkTrue = yield call(checkLimitOverLoad)
          if (checkTrue) {
            yield put(actions.setLimitOverloaded(false))
            localStorage.removeItem("limitOverloaded")
          }
          yield call(
            applyPlaylistSortRule,
            fullLengthPlaylistsFilteredArr[queryNum][pagesCount]
          )
          yield put(
            actions.getPlaylistsOk(
              fullLengthPlaylistsFilteredArr[queryNum][pagesCount]
            )
          )
          yield put(
            actions.createUnsortedTracksArr(tracksPageArr[trackPagesCount])
          )
          yield put(actions.getTracksOk())
        } else {
          pagesCount = pagesCount - 1
          maxSearchPagesCount = maxSearchPagesCount + 1

          yield put(actions.prevPlaylistPage())
          yield put(actions.getPlaylistsReq())

          const authData = yield call(getToken)
          const allPlaylists = yield call(
            myFetch,
            queryPlaylistsCount,
            {
              query: JSON.stringify([
                {
                  name: { $nin: [null, ""] },
                  "tracks.0": { $exists: true },
                },
                {},
              ]),
            },
            { headers: { Authorization: `Bearer ${authData}` } }
          )
          const oldPlaylistslength = yield call(getPlaylistCommonLength)

          if (
            pagesCount === 0 &&
            queryNum === 0 &&
            allPlaylists.PlaylistCount > oldPlaylistslength
          ) {
            const checkTrue = yield call(checkLimitOverLoad)
            if (checkTrue) {
              yield put(actions.setLimitOverloaded(false))
              localStorage.removeItem("limitOverloaded")
            }
            yield put(actions.setPlaylistPageLength(allPlaylists.PlaylistCount))
            localStorage.setItem(
              "playlistCommonLength",
              `${allPlaylists.PlaylistCount}`
            )

            const dowloadedPlaylists = yield call(
              myFetch,
              queryPlaylists,
              {
                query: JSON.stringify([
                  {
                    name: { $nin: [null, ""] },
                    "tracks.0": { $exists: true },
                  },
                  {
                    sort: [{ name: playlistsSortRule }],
                    skip: [0],
                    limit: [QUERY_PLAYLIST_LIMIT],
                  },
                ]),
              },
              { headers: { Authorization: `Bearer ${authData}` } }
            )

            const { arr, limitedArr: arrToFront } = yield call(
              preparingPlaylistsArrToPagination,
              dowloadedPlaylists.PlaylistFind
            )

            savedPlaylistSortRule = playlistsSortRule
            fullLengthPlaylistsFilteredArr = []
            playlistsQueriesArr = []
            playlistsQueriesArr.push(arr)

            yield put(actions.setPlaylistPage(0))
            playlistsPageArr = []
            playlistsPageArr.push(arrToFront)
            fullLengthPlaylistsFilteredArr.push(playlistsPageArr)

            yield put(actions.getPlaylistsOk(arrToFront))

            const playlistIdOld = yield call(getPlaylistId)
            yield put(actions.getTracksReq(playlistIdOld))
          } else {
            const checkTrue = yield call(checkLimitOverLoad)
            if (checkTrue) {
              yield put(actions.setLimitOverloaded(false))
              localStorage.removeItem("limitOverloaded")
            }
            yield call(
              applyPlaylistSortRule,
              fullLengthPlaylistsFilteredArr[queryNum][pagesCount]
            )

            yield put(
              actions.getPlaylistsOk(
                fullLengthPlaylistsFilteredArr[queryNum][pagesCount]
              )
            )
            yield put(
              actions.createUnsortedTracksArr(tracksPageArr[trackPagesCount])
            )
            yield put(actions.getTracksOk())
          }
        }
      }
      // console.log(fullLengthPlaylistsFilteredArr)
      // console.log(playlistsQueriesArr)
      // console.log(playlistsPageArr)
      // console.log(queryNum)
      // console.log(pagesCount)
    } catch (e) {
      yield put(actions.getPlaylistsTracksFail(e))
      throw new Error(`ВСЕ ПРОПАЛО! ${e}`)
    }
  }
}

export function* getNextPlaylistPageSaga(): SagaIterator {
  while (true) {
    try {
      yield take(actions.nextPlaylistPage)

      const checkTrue = yield call(checkLimitOverLoad)
      if (checkTrue) {
        localStorage.removeItem("limitOverloaded")
        yield put(actions.setLimitOverloaded(false))
      }

      const createTrue = yield call(checkPlaylistCreated)
      if (createTrue) {
        localStorage.removeItem("playlistCreated")
        yield put(actions.getPlaylistsReq())

        const authData = yield call(getToken)
        const allPlaylists = yield call(
          myFetch,
          queryPlaylistsCount,
          {
            query: JSON.stringify([
              {
                name: { $nin: [null, ""] },
                "tracks.0": { $exists: true },
              },
              {},
            ]),
          },
          { headers: { Authorization: `Bearer ${authData}` } }
        )

        yield put(actions.setPlaylistPageLength(allPlaylists.PlaylistCount))
        localStorage.setItem(
          "playlistCommonLength",
          `${allPlaylists.PlaylistCount}`
        )

        const dowloadedPlaylists = yield call(
          myFetch,
          queryPlaylists,
          {
            query: JSON.stringify([
              {
                name: { $nin: [null, ""] },
                "tracks.0": { $exists: true },
              },
              {
                sort: [{ name: playlistsSortRule }],
                skip: [0],
                limit: [QUERY_PLAYLIST_LIMIT],
              },
            ]),
          },
          { headers: { Authorization: `Bearer ${authData}` } }
        )
        const { arr, limitedArr: arrToFront } = yield call(
          preparingPlaylistsArrToPagination,
          dowloadedPlaylists.PlaylistFind
        )

        savedPlaylistSortRule = playlistsSortRule
        fullLengthPlaylistsFilteredArr = []
        queryNum = 0
        playlistsQueriesArr = []
        playlistsQueriesArr.push(arr)

        pagesCount = 0
        yield put(actions.setPlaylistPage(0))
        playlistsPageArr = []
        playlistsPageArr.push(arrToFront)
        fullLengthPlaylistsFilteredArr.push(playlistsPageArr)

        yield put(actions.getPlaylistsOk(arrToFront))

        const playlistIdNew = yield call(getPlaylistId)
        yield put(actions.getTracksReq(playlistIdNew))
      } else {
        pagesCount = pagesCount + 1
        maxSearchPagesCount = maxSearchPagesCount - 1

        yield put(actions.nextPlaylistPage())
        yield put(actions.getPlaylistsReq())

        const authData = yield call(getToken)
        const playlistCommonLength = yield call(getPlaylistCommonLength)
        const playlistParticleLength = yield call(getPlaylistParticleLength)

        const nextSlice = playlistsQueriesArr[queryNum].slice(
          pagesCount * PAGE_LIMIT_PLAYLIST,
          pagesCount * PAGE_LIMIT_PLAYLIST + PAGE_LIMIT_PLAYLIST
        )
        yield call(applyPlaylistSortRule, nextSlice)

        if (maxSearchPagesCount >= 0 && searchEnd) {
          if (
            !checkArrIncludesNextSlice(
              fullLengthPlaylistsFilteredArr,
              nextSlice
            )
          ) {
            playlistsPageArr.push(nextSlice)
            fullLengthPlaylistsFilteredArr[queryNum] = playlistsPageArr
            if (!maxSearchPagesCount) {
              localStorage.setItem("limitOverloaded", "yes")
              yield put(actions.setLimitOverloaded(true))
            }
            yield put(actions.getPlaylistsOk(nextSlice))
            yield put(
              actions.createUnsortedTracksArr(tracksPageArr[trackPagesCount])
            )
            yield put(actions.getTracksOk())
          } else {
            yield call(
              applyPlaylistSortRule,
              fullLengthPlaylistsFilteredArr[queryNum][pagesCount]
            )
            yield put(
              actions.getPlaylistsOk(
                fullLengthPlaylistsFilteredArr[queryNum][pagesCount]
              )
            )
            yield put(
              actions.createUnsortedTracksArr(tracksPageArr[trackPagesCount])
            )
            yield put(actions.getTracksOk())
            if (!maxSearchPagesCount) {
              localStorage.setItem("limitOverloaded", "yes")
              yield put(actions.setLimitOverloaded(true))
            }
          }
        } else {
          if (
            queryNum * QUERY_PLAYLIST_LIMIT + QUERY_PLAYLIST_LIMIT <
            playlistCommonLength
          ) {
            if (pagesCount * PAGE_LIMIT_PLAYLIST < QUERY_PLAYLIST_LIMIT) {
              if (
                playlistsPageArr.length === pagesCount &&
                !checkArrIncludesNextSlice(
                  fullLengthPlaylistsFilteredArr,
                  nextSlice
                )
              ) {
                playlistsPageArr.push(nextSlice)
                fullLengthPlaylistsFilteredArr[queryNum] = playlistsPageArr
              }

              yield put(actions.getPlaylistsOk(nextSlice))
            } else if (
              pagesCount * PAGE_LIMIT_PLAYLIST ===
              QUERY_PLAYLIST_LIMIT
            ) {
              queryNum = queryNum + 1

              if (playlistsQueriesArr.length === queryNum) {
                const dowloadedPlaylists = yield call(
                  myFetch,
                  queryPlaylists,
                  {
                    query: JSON.stringify([
                      {
                        name: { $nin: [null, ""] },
                        "tracks.0": { $exists: true },
                      },
                      {
                        sort: [{ name: savedPlaylistSortRule }],
                        skip: [queryNum * QUERY_PLAYLIST_LIMIT],
                        limit: [QUERY_PLAYLIST_LIMIT],
                      },
                    ]),
                  },
                  { headers: { Authorization: `Bearer ${authData}` } }
                )

                const { arr, limitedArr: arrToFront } = yield call(
                  preparingPlaylistsArrToPagination,
                  dowloadedPlaylists.PlaylistFind
                )

                localStorage.setItem("playlistParticleLength", `${arr.length}`)

                if (arr.length <= PAGE_LIMIT_PLAYLIST) {
                  localStorage.setItem("limitOverloaded", "yes")
                  yield put(actions.setLimitOverloaded(true))
                }

                playlistsQueriesArr.push(arr)
                pagesCount = 0
                playlistsPageArr = []
                playlistsPageArr.push(arrToFront)
                fullLengthPlaylistsFilteredArr[queryNum] = playlistsPageArr

                yield put(actions.getPlaylistsOk(arrToFront))
              } else {
                pagesCount = 0
                if (
                  playlistsQueriesArr[queryNum].length <= PAGE_LIMIT_PLAYLIST
                ) {
                  localStorage.setItem("limitOverloaded", "yes")
                  yield put(actions.setLimitOverloaded(true))
                }
                yield put(
                  actions.getPlaylistsOk(
                    fullLengthPlaylistsFilteredArr[queryNum][pagesCount]
                  )
                )
              }
            }
          } else {
            if (
              pagesCount * PAGE_LIMIT_PLAYLIST + PAGE_LIMIT_PLAYLIST <
              +playlistParticleLength
            ) {
              if (
                playlistsPageArr.length === pagesCount &&
                !checkArrIncludesNextSlice(
                  fullLengthPlaylistsFilteredArr,
                  nextSlice
                )
              ) {
                playlistsPageArr.push(nextSlice)
                fullLengthPlaylistsFilteredArr[queryNum] = playlistsPageArr
              }
              yield put(actions.getPlaylistsOk(nextSlice))
            } else {
              if (
                playlistsPageArr.length === pagesCount &&
                !checkArrIncludesNextSlice(
                  fullLengthPlaylistsFilteredArr,
                  nextSlice
                )
              ) {
                playlistsPageArr.push(nextSlice)
                fullLengthPlaylistsFilteredArr[queryNum] = playlistsPageArr
              }
              localStorage.setItem("limitOverloaded", "yes")
              yield put(actions.setLimitOverloaded(true))
              yield put(actions.getPlaylistsOk(nextSlice))
            }
          }
        }

        // console.log(fullLengthPlaylistsFilteredArr)
        // console.log(playlistsQueriesArr)
        // console.log(playlistsPageArr)
        // console.log(queryNum)
        // console.log(pagesCount)
        yield put(
          actions.createUnsortedTracksArr(tracksPageArr[trackPagesCount])
        )
        yield put(actions.getTracksOk())
        // const playlistIdNew = yield call(getPlaylistId)
        // yield put(actions.getTracksReq(playlistIdNew))
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
      const { payload: transitTracksData } = yield take(
        actions.createTracksArrayReq
      )
      yield put(actions.setPlaylistsPendingStatus())
      yield put(actions.clearSearchLine(true))

      if (searchEnd) {
        localStorage.removeItem("limitOverloaded")
        yield put(actions.setLimitOverloaded(false))
      }
      const { payload: data } = yield take(actions.createPlaylistReq)

      const transitRes = yield call(tracksPreparingToUpload, transitTracksData)
      const tracksServerInfo = yield call(allTracks, transitRes)
      yield put(actions.createTracksArrayOk(tracksServerInfo))

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

      localStorage.setItem("playlistCreated", "true")
      const limitedPlaylists = yield call(
        myFetch,
        queryPlaylists,
        {
          query: JSON.stringify([
            {},
            {
              sort: [{ _id: -1 }],
              limit: [1],
            },
          ]),
        },
        { headers: { Authorization: `Bearer ${authData}` } }
      )

      trackPagesCount = 0
      localStorage.setItem("tracksPagesCount", `${trackPagesCount}`)
      tracksPageArr = []
      yield put(actions.setTrackPage(0))
      yield put(actions.getPlaylistsOk(limitedPlaylists))

      const newPlaylistId: string = limitedPlaylists.PlaylistFind[0]._id
      createdPlaylistId = newPlaylistId
      playlistOld = newPlaylistId

      localStorage.setItem("playlistId", newPlaylistId)
      yield put(actions.getTracksReq(newPlaylistId))

      const searchUndone = yield take(actions.clearSearchLine)
      yield put(actions.clearSearchLine(searchUndone))
      yield put(actions.createPlaylistSuccess())
    } catch (e) {
      yield put(actions.createTracksArrayFail())
      yield put(actions.createPlaylistFailure())

      throw new Error(`Playlist creation rejected: ${e}`)
    }
  }
}

export function* deleteTrackSaga(): SagaIterator {
  while (true) {
    try {
      const { payload: trackIdToDelete } = yield take(actions.deleteTrackReq)
      localStorage.setItem("trackDeleteTrue", "true")
      yield put(actions.showAlert(true))
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
      yield put(actions.deleteTrackSuccess())
      yield delay(100)
      if (yes.PlaylistUpsert.tracks.length) {
        const playlistUpsertId = `${yes.PlaylistUpsert._id}`
        localStorage.setItem("playlistId", playlistUpsertId)
        yield put(actions.getTracksReq(playlistUpsertId))
      } else {
        localStorage.removeItem("setTracksTrue")
        localStorage.removeItem("playlistId")
        yield put(actions.clearSearchLine(true))
        const checkTrue = yield call(checkLimitOverLoad)
        if (checkTrue) {
          yield put(actions.setLimitOverloaded(false))
          localStorage.removeItem("limitOverloaded")
        }
        yield put(actions.getPlaylistsReq())
        const allPlaylists = yield call(
          myFetch,
          queryPlaylistsCount,
          {
            query: JSON.stringify([
              {
                name: { $nin: [null, ""] },
                "tracks.0": { $exists: true },
              },
              {},
            ]),
          },
          { headers: { Authorization: `Bearer ${authData}` } }
        )

        yield put(actions.setPlaylistPageLength(allPlaylists.PlaylistCount))
        localStorage.setItem(
          "playlistCommonLength",
          `${allPlaylists.PlaylistCount}`
        )

        const dowloadedPlaylists = yield call(
          myFetch,
          queryPlaylists,
          {
            query: JSON.stringify([
              {
                name: { $nin: [null, ""] },
                "tracks.0": { $exists: true },
              },
              {
                sort: [{ name: playlistsSortRule }],
                skip: [0],
                limit: [QUERY_PLAYLIST_LIMIT],
              },
            ]),
          },
          { headers: { Authorization: `Bearer ${authData}` } }
        )

        const { arr, limitedArr: arrToFront } = yield call(
          preparingPlaylistsArrToPagination,
          dowloadedPlaylists.PlaylistFind
        )
        maxSearchPagesCount = 0

        savedPlaylistSortRule = playlistsSortRule
        fullLengthPlaylistsFilteredArr = []
        queryNum = 0
        playlistsQueriesArr = []
        playlistsQueriesArr.push(arr)

        pagesCount = 0
        yield put(actions.setPlaylistPage(0))
        playlistsPageArr = []
        playlistsPageArr[pagesCount] = arrToFront
        fullLengthPlaylistsFilteredArr[queryNum] = playlistsPageArr

        const playlistModifiedLength = yield call(getPlaylistModifiedLength)

        if (PAGE_LIMIT_PLAYLIST < playlistModifiedLength) {
          yield put(actions.getPlaylistsOk(arrToFront))
        } else {
          yield put(actions.getPlaylistsOk(arrToFront))
          localStorage.setItem("limitOverloaded", "yes")
          yield put(actions.setLimitOverloaded(true))
        }

        const tracks = yield call(
          myFetch,
          queryTracks,
          {
            query: JSON.stringify([
              {},
              {
                sort: [{ _id: -1 }],
                limit: [TRACKS_START_LIMIT],
              },
            ]),
          },
          { headers: { Authorization: `Bearer ${authData}` } }
        )
        const modifiedArrToFront = yield call(
          preparingTracksArrToFront,
          tracks.TrackFind
        )

        fullLengthTracksArr = modifiedArrToFront
        tracksArrSize = modifiedArrToFront.length
        localStorage.setItem("tracksArrSize", `${tracksArrSize}`)
        const limitedTracksArr = modifiedArrToFront.slice(0, PAGE_LIMIT_TRACK)
        trackPagesCount = 0
        localStorage.setItem("tracksPagesCount", `${trackPagesCount}`)
        tracksPageArr = []
        yield put(actions.setTrackPage(0))
        tracksPageArr.push(limitedTracksArr)

        const checkTracksOverloadTrue = yield call(checkTrackPageLimitOverload)
        if (checkTracksOverloadTrue) {
          yield put(actions.setTrackPageLimitOverloaded(false))
          localStorage.removeItem("trackPageLimitOverload")
        }
        if (PAGE_LIMIT_TRACK >= tracksArrSize) {
          localStorage.setItem("trackPageLimitOverload", "yes")
          yield put(actions.setTrackPageLimitOverloaded(true))
        }

        yield put(actions.createUnsortedTracksArr(limitedTracksArr))
        const searchUndone = yield take(actions.clearSearchLine)
        yield put(actions.clearSearchLine(searchUndone))
        yield put(actions.getTracksOk())
      }

      yield put(actions.showAlert(false))
      localStorage.removeItem("trackDeleteTrue")
    } catch (e) {
      yield put(actions.deleteTrackFailure())
      throw new Error(`delete track rejected: ${e}`)
    }
  }
}

export function* createSortableListSaga(): SagaIterator {
  while (true) {
    const { payload: unsortedTracksAr } = yield take(
      actions.createUnsortedTracksArr
    )
    tracksPageArr[trackPagesCount] = unsortedTracksAr
    yield put(actions.createUnsortedTracksArr(unsortedTracksAr))
  }
}

export function* setPlaylistSortRule(): SagaIterator {
  while (true) {
    const { payload: playlistSortRule } = yield take(
      actions.setPlaylistBackendSortRule
    )
    playlistsSortRule = +playlistSortRule
    if (queryNum) {
      yield put(actions.getPlaylistsReq())
      yield call(
        applyPlaylistSortRule,
        fullLengthPlaylistsFilteredArr[queryNum][pagesCount]
      )
      yield put(
        actions.getPlaylistsOk(
          fullLengthPlaylistsFilteredArr[queryNum][pagesCount]
        )
      )

      yield put(actions.createUnsortedTracksArr(tracksPageArr[trackPagesCount]))
      yield put(actions.getTracksOk())
    } else if (queryNum === 0 && pagesCount === 0) {
      yield put(actions.getPlaylistsReq())
      const authData = yield call(getToken)

      const allPlaylists = yield call(
        myFetch,
        queryPlaylistsCount,
        {
          query: JSON.stringify([
            {
              name: { $nin: [null, ""] },
              "tracks.0": { $exists: true },
            },
            {},
          ]),
        },
        { headers: { Authorization: `Bearer ${authData}` } }
      )
      const oldPlaylistslength = yield call(getPlaylistCommonLength)

      if (allPlaylists.PlaylistCount > oldPlaylistslength) {
        yield put(actions.setPlaylistPageLength(allPlaylists.PlaylistCount))
        localStorage.setItem(
          "playlistCommonLength",
          `${allPlaylists.PlaylistCount}`
        )
      }

      const dowloadedPlaylists = yield call(
        myFetch,
        queryPlaylists,
        {
          query: JSON.stringify([
            {
              name: { $nin: [null, ""] },
              "tracks.0": { $exists: true },
            },
            {
              sort: [{ name: playlistsSortRule }],
              skip: [0],
              limit: [QUERY_PLAYLIST_LIMIT],
            },
          ]),
        },
        { headers: { Authorization: `Bearer ${authData}` } }
      )

      const { arr, limitedArr: arrToFront } = yield call(
        preparingPlaylistsArrToPagination,
        dowloadedPlaylists.PlaylistFind
      )

      savedPlaylistSortRule = playlistsSortRule
      fullLengthPlaylistsFilteredArr = []
      queryNum = 0
      playlistsQueriesArr = []
      playlistsQueriesArr.push(arr)

      pagesCount = 0
      yield put(actions.setPlaylistPage(0))
      playlistsPageArr = []

      yield call(applyPlaylistSortRule, arrToFront)

      playlistsPageArr.push(arrToFront)
      fullLengthPlaylistsFilteredArr.push(playlistsPageArr)

      yield put(actions.getPlaylistsOk(arrToFront))
      yield put(actions.createUnsortedTracksArr(tracksPageArr[trackPagesCount]))
      yield put(actions.getTracksOk())
    } else if (queryNum === 0 && pagesCount) {
      yield put(actions.getPlaylistsReq())
      yield call(applyPlaylistSortRule, playlistsPageArr[pagesCount])
      yield put(actions.getPlaylistsOk(playlistsPageArr[pagesCount]))
      yield put(actions.createUnsortedTracksArr(tracksPageArr[trackPagesCount]))
      yield put(actions.getTracksOk())
    }

    yield put(actions.setPlaylistBackendSortRule(playlistSortRule))
  }
}

export function* getPrevTrackPageSaga(): SagaIterator {
  while (true) {
    try {
      yield take(actions.prevTrackPage)
      trackPagesCount = trackPagesCount - 1
      localStorage.setItem("tracksPagesCount", `${trackPagesCount}`)
      yield put(actions.prevTrackPage())

      const checkTrue = yield call(checkTrackPageLimitOverload)
      if (checkTrue) {
        yield put(actions.setTrackPageLimitOverloaded(false))
        localStorage.removeItem("trackPageLimitOverload")
      }
      yield put(actions.createUnsortedTracksArr(tracksPageArr[trackPagesCount]))
      yield put(actions.getTracksOk())
    } catch (e) {
      throw new Error(`getPrevTrackPageSaga FAIL! ${e}`)
    }
  }
}

export function* getNextTrackPageSaga(): SagaIterator {
  while (true) {
    try {
      yield take(actions.nextTrackPage)
      trackPagesCount = trackPagesCount + 1
      localStorage.setItem("tracksPagesCount", `${trackPagesCount}`)
      yield put(actions.nextTrackPage())

      const nextTracksArrSlice = fullLengthTracksArr.slice(
        trackPagesCount * PAGE_LIMIT_TRACK,
        trackPagesCount * PAGE_LIMIT_TRACK + PAGE_LIMIT_TRACK
      )

      if (tracksPageArr.length === trackPagesCount) {
        tracksPageArr.push(nextTracksArrSlice)
        if (
          trackPagesCount * PAGE_LIMIT_TRACK + PAGE_LIMIT_TRACK <
          tracksArrSize
        ) {
          yield put(actions.createUnsortedTracksArr(nextTracksArrSlice))
          yield put(actions.getTracksOk())
        } else {
          yield put(actions.createUnsortedTracksArr(nextTracksArrSlice))
          yield put(actions.getTracksOk())
          localStorage.setItem("trackPageLimitOverload", "yes")
          yield put(actions.setTrackPageLimitOverloaded(true))
        }
      } else {
        if (
          trackPagesCount * PAGE_LIMIT_TRACK + PAGE_LIMIT_TRACK <
          tracksArrSize
        ) {
          yield put(
            actions.createUnsortedTracksArr(tracksPageArr[trackPagesCount])
          )
          yield put(actions.getTracksOk())
        } else {
          yield put(
            actions.createUnsortedTracksArr(tracksPageArr[trackPagesCount])
          )
          yield put(actions.getTracksOk())
          localStorage.setItem("trackPageLimitOverload", "yes")
          yield put(actions.setTrackPageLimitOverloaded(true))
        }
      }
    } catch (e) {
      throw new Error(`getNextTrackPageSaga FAIL! ${e}`)
    }
  }
}

export function* playlistSearchSaga(): SagaIterator {
  while (true) {
    try {
      console.log("search Start")
      const { payload: isSearchLineEmpty } = yield take(
        actions.updatePlaylistList
      )
      if (isSearchLineEmpty !== null) {
        const { payload: searchQuery } = yield take(
          actions.setSearchQueryToSaga
        )
        const checkTrue = yield call(checkLimitOverLoad)
        if (checkTrue) {
          localStorage.removeItem("limitOverloaded")
          yield put(actions.setLimitOverloaded(false))
        }
        const createTrue = yield call(checkPlaylistCreated)
        if (createTrue) {
          localStorage.removeItem("playlistCreated")
        }
        yield put(actions.setSearchStatus("searching"))
        const authData = yield call(getToken)
        yield put(actions.getPlaylistsReq())
        const dowloadedPlaylists = yield call(
          myFetch,
          queryPlaylists,
          {
            query: JSON.stringify([
              {
                name: String(searchQuery),
                "tracks.0": { $exists: true },
              },
              {
                sort: [{ name: playlistsSortRule }],
                skip: [0],
              },
            ]),
          },
          { headers: { Authorization: `Bearer ${authData}` } }
        )
        const { arr, limitedArr: arrToFront } = yield call(
          preparingPlaylistsArrToPagination,
          dowloadedPlaylists.PlaylistFind
        )
        maxSearchPagesCount = Math.ceil(arr.length / arrToFront.length) - 1

        savedPlaylistSortRule = playlistsSortRule
        fullLengthPlaylistsFilteredArr = []
        queryNum = 0
        playlistsQueriesArr = []
        playlistsQueriesArr.push(arr)

        pagesCount = 0
        yield put(actions.setPlaylistPage(0))
        playlistsPageArr = []
        playlistsPageArr[pagesCount] = arrToFront
        fullLengthPlaylistsFilteredArr[queryNum] = playlistsPageArr

        const playlistModifiedLength = yield call(getPlaylistModifiedLength)
        if (PAGE_LIMIT_PLAYLIST < playlistModifiedLength) {
          yield put(actions.getPlaylistsOk(arrToFront))
        } else {
          yield put(actions.getPlaylistsOk(arrToFront))
          localStorage.setItem("limitOverloaded", "yes")
          yield put(actions.setLimitOverloaded(true))
        }
        const playlistIdOld = yield call(getPlaylistId)
        yield put(actions.getTracksReq(playlistIdOld))
        playlistOld = playlistIdOld

        searchEnd = true
        continue
      } else {
        const authData = yield call(getToken)
        yield put(actions.getPlaylistsReq())
        const checkTrue = yield call(checkLimitOverLoad)
        if (checkTrue) {
          localStorage.removeItem("limitOverloaded")
          yield put(actions.setLimitOverloaded(false))
        }
        const allPlaylists = yield call(
          myFetch,
          queryPlaylistsCount,
          {
            query: JSON.stringify([
              {
                name: { $nin: [null, ""] },
                "tracks.0": { $exists: true },
              },
              {},
            ]),
          },
          { headers: { Authorization: `Bearer ${authData}` } }
        )

        yield put(actions.setPlaylistPageLength(allPlaylists.PlaylistCount))
        localStorage.setItem(
          "playlistCommonLength",
          `${allPlaylists.PlaylistCount}`
        )

        const dowloadedPlaylists = yield call(
          myFetch,
          queryPlaylists,
          {
            query: JSON.stringify([
              {
                name: { $nin: [null, ""] },
                "tracks.0": { $exists: true },
              },
              {
                sort: [{ name: playlistsSortRule }],
                skip: [0],
                limit: [QUERY_PLAYLIST_LIMIT],
              },
            ]),
          },
          { headers: { Authorization: `Bearer ${authData}` } }
        )

        const { arr, limitedArr: arrToFront } = yield call(
          preparingPlaylistsArrToPagination,
          dowloadedPlaylists.PlaylistFind
        )

        maxSearchPagesCount = 0

        savedPlaylistSortRule = playlistsSortRule
        fullLengthPlaylistsFilteredArr = []
        queryNum = 0
        playlistsQueriesArr = []
        playlistsQueriesArr.push(arr)

        pagesCount = 0
        yield put(actions.setPlaylistPage(0))
        playlistsPageArr = []
        playlistsPageArr[pagesCount] = arrToFront
        fullLengthPlaylistsFilteredArr[queryNum] = playlistsPageArr

        yield put(actions.setSearchStatus(""))
        const playlistModifiedLength = yield call(getPlaylistModifiedLength)

        if (PAGE_LIMIT_PLAYLIST < playlistModifiedLength) {
          yield put(actions.getPlaylistsOk(arrToFront))
        } else {
          yield put(actions.getPlaylistsOk(arrToFront))
          localStorage.setItem("limitOverloaded", "yes")
          yield put(actions.setLimitOverloaded(true))
        }
        const playlistIdOld = yield call(getPlaylistId)
        yield put(actions.getTracksReq(playlistIdOld))

        searchEnd = false
      }
    } catch (e) {
      throw new Error(`playlistSearchSaga FAIL! ${e}`)
    }
  }
}
