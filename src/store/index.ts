import { applyMiddleware, createStore } from "redux"
import createSagaMiddleware from "redux-saga"
import { all, spawn } from "redux-saga/effects"
import { authSaga, regSaga } from "./auth/saga"
import {
  getPrevPlaylistPageSaga,
  getNextPlaylistPageSaga,
  getPlaylistsSaga,
  getTracksSaga,
  createPlaylistSaga,
  deleteTrackSaga,
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
  ])
}

const sagaMiddleware = createSagaMiddleware()
const store = createStore(rootReducer, {}, applyMiddleware(sagaMiddleware))

sagaMiddleware.run(rootSaga)

export default store
