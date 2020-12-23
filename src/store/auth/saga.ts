import { SagaIterator } from "redux-saga"
import { call, put, take } from "redux-saga/effects"
import * as actions from "./../../store/actions"
import { myFetch } from "./../../store/apiClient"

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

export function* authSaga(): SagaIterator {
  while (true) {
    const getToken = () => localStorage.getItem("token")
    const authData = yield call(getToken)
    if (authData) {
      yield put(actions.authSuccess(authData))
    } else {
      try {
        const action = yield take(actions.authRequest)
        const { login: token } = yield call(myFetch, query, {
          login: action.payload.login,
          password: action.payload.password,
        })
        localStorage.setItem("token", token)
        
        yield put(actions.authSuccess(token))
      } catch (e) {
        console.error("!!! function*authSaga -> error", e)
        yield put(actions.authFailure(e))
      }
    }

    yield take(actions.logout)
    yield put(actions.logout())
    localStorage.removeItem("token")
    localStorage.removeItem("setTracksTrue")
    localStorage.removeItem("playlistPageLength")
  }
}

export function* regSaga(): SagaIterator {
  while (true) {
    const regAction = yield take(actions.regRequest)

    yield call(myFetch, mutation, {
      login: regAction.payload.login,
      password: regAction.payload.password,
    })

    const { login: token } = yield call(myFetch, query, {
      login: regAction.payload.login,
      password: regAction.payload.password,
    })
    localStorage.setItem("token", token)
    yield put(actions.authSuccess(token))
  }
}
