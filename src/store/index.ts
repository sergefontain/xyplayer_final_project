import { applyMiddleware, createStore } from "redux"
import createSagaMiddleware from "redux-saga"
import { all, spawn } from "redux-saga/effects"
import { authSaga, regSaga } from "./auth/saga"
import {
  setPlaylistToPlaySaga,
  initializeSaga,
  setTrackPlayStateSaga,
  initializeShuffleSaga,
  setShuffleToPlaySaga,
} from "./player/saga"
import {
  getPrevPlaylistPageSaga,
  getNextPlaylistPageSaga,
  getPlaylistsSaga,
  getTracksSaga,
  createPlaylistSaga,
  deleteTrackSaga,
  createSortableListSaga,
  setPlaylistSortRule,
  getNextTrackPageSaga,
  getPrevTrackPageSaga,
  playlistSearchSaga,
} from "./main/saga"

import rootReducer from "./rootReducer"

function* rootSaga() {
  yield all([
    spawn(authSaga),
    spawn(regSaga),
    spawn(getPlaylistsSaga),
    spawn(getTracksSaga),
    spawn(getPrevPlaylistPageSaga),
    spawn(getNextPlaylistPageSaga),
    spawn(createPlaylistSaga),
    spawn(deleteTrackSaga),
    spawn(createSortableListSaga),
    spawn(setPlaylistSortRule),
    spawn(setPlaylistToPlaySaga),
    spawn(initializeSaga),
    spawn(getNextTrackPageSaga),
    spawn(getPrevTrackPageSaga),
    spawn(setTrackPlayStateSaga),
    spawn(initializeShuffleSaga),
    spawn(setShuffleToPlaySaga),
    spawn(playlistSearchSaga)
  ])
}

const sagaMiddleware = createSagaMiddleware()
const store = createStore(rootReducer, {}, applyMiddleware(sagaMiddleware))

sagaMiddleware.run(rootSaga)

export default store
