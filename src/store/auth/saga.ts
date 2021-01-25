import { SagaIterator } from "redux-saga"
import { call, put, take } from "redux-saga/effects"
import * as actions from "./../../store/actions"
import { myFetch } from "./../../store/apiClient"

/*
** Service queries 
*/

const query = `
  query log($login: String!, $password: String!) {
    login(login: $login, password: $password)
  }
`
const mutation = `
  mutation createUser($login: String!, $password: String!){
    createUser(login: $login, password: $password){
        login
        _id
    }
  }
`

/*
** Auth Sagas 
*/

export function* authSaga(): SagaIterator {
  while (true) {
    const getToken = () => localStorage.getItem("token")
    const authData = yield call(getToken)
    try {
      if (!!authData) {
        yield put(actions.authSuccess(authData))
      } else {
        const {
          payload: { login, password },
        } = yield take(actions.authRequest)

        const { login: token } = yield call(myFetch, query, {
          login: login,
          password: password,
        })
        if (token === null) {
          throw new Error(`authSaga ERROR`)
        }

        localStorage.setItem("token", token)
        yield put(actions.authSuccess(token))
      }

      yield take(actions.logout)
      yield put(actions.logout())
      localStorage.removeItem("token")
      localStorage.removeItem("setTracksTrue")
      localStorage.removeItem("playlistCommonLength")
      localStorage.removeItem("playlistModifiedLength")
      localStorage.removeItem("playlistParticleLength")
      localStorage.removeItem("limitOverloaded")
      localStorage.removeItem("trackPageLimitOverload")
      localStorage.removeItem("playlistCreated")
      localStorage.removeItem("tracksArrSize")
      localStorage.removeItem("tracksPagesCount")
      localStorage.removeItem("stopLoopedPlay")
      localStorage.removeItem("createdPlaylistId")
      localStorage.removeItem("trackDeleteTrue")
    } catch (e) {
      yield put(actions.authFailure(e))
    }
  }
}

export function* regSaga(): SagaIterator {
  while (true) {
    try {
      const {
        payload: { login, password },
      } = yield take(actions.regRequest)

      yield call(myFetch, mutation, {
        login: login,
        password: password,
      })

      yield put(actions.authRequest({ login: login, password: password }))
    } catch (e) {
      throw new Error(`regSaga ERROR ${e}`)
    }
  }
}
