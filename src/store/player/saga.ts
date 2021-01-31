import { SagaIterator } from "redux-saga"
import { take, delay, call, put } from "redux-saga/effects"
import * as actions from "../actions"

let trackIndex = 0
let iterCount = 1
let pastPage = ""
let pageFilled = 0
let shufflePageChosenTracks: string[] = []
let shuffleSummary: string[][] = []
let shufflePages: any = {}
let isLoopTrue = true
let isCurrentPagetheSamePageToPlay = false

/*
 ** Service functions
 */

const getTracksArrSize = () => localStorage.getItem("tracksArrSize")
const getTracksPagesCount = () => localStorage.getItem("tracksPagesCount")
// const getStopStatus = () => localStorage.getItem("stopLoopedPlay")
const setIsLoopTrue = (val: boolean) => (isLoopTrue = val)

const checkObjIncludesNextArr = (obj: any, index: string) => {
  let result = false
  for (let key in obj) {
    if (key === index) result = true
  }
  return result
}

const chooseRandomPage = (
  currPage: string,
  maxPageCount: number,
  arr: string[][],
  maxPageArrSize: number,
  obj: any,
  pageFilledCount: number
) => {
  let allowPagesArr: number[] = []
  let extraArr: number[] = []

  if (pageFilledCount) {
    for (let count = 0; count < maxPageCount - pageFilledCount; count++) {
      if (count !== +currPage) {
        if (arr[count]?.length !== maxPageArrSize) {
          allowPagesArr.push(count)
        }
      }
    }
  } else {
    for (let count = 0; count < maxPageCount; count++) {
      if (count !== +currPage) {
        if (obj[`${count}`]) {
          if (arr[count]?.length !== obj[`${count}`].length) {
            if (count === maxPageCount - 1) {
              allowPagesArr.push(count)
            } else {
              allowPagesArr.push(count)
            }
          }
        } else {
          if (arr[count]?.length !== maxPageArrSize) {
            allowPagesArr.push(count)
          }
        }
      }
    }
  }

  // console.log("allowPagesArr", allowPagesArr)

  if (!allowPagesArr.length) {
    if (pageFilledCount) {
      for (let count = 0; count < maxPageCount - pageFilledCount; count++) {
        if (arr[count]?.length !== maxPageArrSize) {
          extraArr.push(count)
        }
      }
    } else {
      for (let count = 0; count < maxPageCount; count++) {
        if (obj[`${count}`]) {
          if (arr[count]?.length !== obj[`${count}`].length) {
            if (count === maxPageCount - 1) {
              extraArr.push(count)
            } else {
              extraArr.push(count)
            }
          }
        } else {
          if (arr[count]?.length !== maxPageArrSize) {
            extraArr.push(count)
          }
        }
      }
    }
  }

  let nextPageToPlay =
    allowPagesArr[Math.ceil(Math.random() * (allowPagesArr.length - 1))]

  let extraPageToPlay =
    extraArr[Math.ceil(Math.random() * (extraArr.length - 1))]

  if (allowPagesArr.length) {
    return nextPageToPlay
  } else {
    return extraArr.length ? extraPageToPlay : true
  }
}

const chooseRandomTrack = (
  arr: HTMLDivElement[],
  exceptionArr?: string[] | undefined
) => {
  // console.log("arr", arr)
  // console.log("exceptionArr", exceptionArr)

  let indexArr: number[] = []
  let allowArrIndex: number[] = []
  let allowArr: number[] = []
  let disallowArr: number[] = []
  let allowNameArr: Array<string | undefined | null> = []

  for (let key in arr) {
    indexArr.push(+key)
  }

  if (exceptionArr?.length) {
    for (let item of exceptionArr) {
      let ind = arr.findIndex((node) => node.textContent === item)
      if (ind !== -1) {
        disallowArr.push(ind)
      }
    }

    allowArrIndex = indexArr.filter((el) => !disallowArr.includes(el))
  }

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== null) {
      allowArr.push(i)
      allowNameArr.push(arr[i].textContent ? arr[i].textContent : undefined)
    }
  }

  let nextTrackIndexToPlay =
    allowArrIndex[Math.ceil(Math.random() * (allowArrIndex.length - 1))]

  let nextTrackIndex =
    allowArr[Math.ceil(Math.random() * (allowArr.length - 1))]

  let origin =
    allowNameArr[exceptionArr?.length ? nextTrackIndexToPlay : nextTrackIndex]

  // console.log("allowArr", allowArr)
  // console.log("disallowArr", disallowArr)
  // console.log("allowArrIndex", allowArrIndex)
  // console.log("allowNameArr", allowNameArr)
  // console.log("nextTrackIndexToPlay", nextTrackIndexToPlay)
  // console.log("nextTrackIndex", nextTrackIndex)
  // console.log("origin", origin)

  if (disallowArr.length) {
    return { i: nextTrackIndexToPlay, origin }
  } else {
    return { i: nextTrackIndex, origin }
  }
}

/*
 ** Playback Sagas
 */

export function* setTrackPlayStateSaga(): SagaIterator {
  while (true) {
    try {
      const { payload: playState } = yield take(actions.setPlayStateAction)
      yield put(actions.setPlayStateAction(playState))
    } catch (e) {
      throw new Error("setTrackStateAction failure!")
    }
  }
}

export function* initializeShuffleSaga(): SagaIterator {
  while (true) {
    console.log("start initializeShuffleSaga")
    try {
      const { payload: playStatus } = yield take(actions.setTurnOnShufflePlay)
      yield put(actions.setTurnOnShufflePlay(true))
      if (playStatus) {
        const { payload: arr } = yield take(actions.setTracksArrToConstantPlay)

        const pagesCount: string = yield call(getTracksPagesCount)
        pastPage = pagesCount
        const { i: trackIndex, origin: trackName } = yield call(
          chooseRandomTrack,
          arr,
          undefined
        )
        arr[trackIndex].click()
        shufflePageChosenTracks = []
        shufflePageChosenTracks.push(trackName)
        shuffleSummary = []
        shuffleSummary[+pagesCount] = shufflePageChosenTracks

        const indexToDel = arr.findIndex(
          (node: HTMLDivElement) => node === null
        )
        let copy = arr.slice(0, indexToDel)
        shufflePages = {}
        shufflePages[pagesCount] = indexToDel !== -1 ? [...copy] : [...arr]

        const tracksArrSize = yield call(getTracksArrSize)
        let maxPagesCount = Math.ceil(tracksArrSize / arr.length)
        if (
          shufflePageChosenTracks.length === shufflePages[pagesCount].length &&
          +pagesCount === maxPagesCount - 1
        ) {
          pageFilled = pageFilled + 1
        }
        yield put(actions.setInitializeShuffleSuccess(true))
      } else {
        yield put(actions.setTurnOffShufflePlay(true))
        yield put(actions.setTrackOrderToPlay(""))
        // localStorage.setItem("stopLoopedPlay", "stop")
        continue
      }
    } catch (e) {
      throw new Error(`INITIALIZE Shuffle SAGA ERROR: ${e}`)
    }
  }
}

export function* setShuffleToPlaySaga(): SagaIterator {
  while (true) {
    console.log("common SHUFFLE start")
    try {
      const { payload: isStartSuccess } = yield take(
        actions.setInitializeShuffleSuccess
      )
      setIsLoopTrue(true)
      if (isStartSuccess) {
        do {
          console.log("local SHUFFLE loop start")
          const {
            payload: playingStatus,
            meta: {
              i: currentTrackIndex,
              buttons: { prevButton, nextButton },
              arr,
              closeBtnRef: { current: closeBtn },
              ...rest
            },
          } = yield take(actions.setPlayingStatus)

          const tracksArrSize = yield call(getTracksArrSize)
          const pagesCount = yield call(getTracksPagesCount)

          if (playingStatus === "closed") {
            yield put(actions.setTurnOnShufflePlay(false))
            setIsLoopTrue(false)
            yield put(actions.setPlayingMode("single"))
            let currPage = yield call(getTracksPagesCount)
            yield put(actions.setTrackPage(+currPage))
            yield put(actions.setPlayStateAction(""))
            iterCount = 0
            pastPage = ""
            pageFilled = 0
            shufflePageChosenTracks = []
            shuffleSummary = []
            shufflePages = {}
            yield delay(100)
            // localStorage.removeItem("stopLoopedPlay")
            continue
          }

          if (playingStatus === "ended") {
            let maxPagesCount = Math.ceil(tracksArrSize / arr.length)

            if (iterCount < arr.length) {
              closeBtn.click()
              yield take(actions.setShowPlaylistTracks)
              yield delay(50)

              if (+pagesCount === 0) {
                let randomVar = Math.ceil(
                  Math.random() *
                    (maxPagesCount - 1 - (pageFilled ? pageFilled : 0))
                )
                if (randomVar === 0) {
                  isCurrentPagetheSamePageToPlay = true
                } else {
                  for (let i = 0; i < randomVar; i++) {
                    nextButton.click()
                  }
                }
              } else if (+pagesCount === maxPagesCount - 1) {
                let randomVar = Math.ceil(Math.random() * maxPagesCount)
                if (randomVar === 0) {
                  isCurrentPagetheSamePageToPlay = true
                } else {
                  for (let i = 0; i < randomVar; i++) {
                    prevButton.click()
                  }
                }
              } else {
                if (Math.random() > 0.5) {
                  if (!pageFilled) {
                    nextButton.click()
                  } else {
                    prevButton.click()
                  }
                } else {
                  prevButton.click()
                }
              }

              if (isCurrentPagetheSamePageToPlay) {
                console.log("!!!!!!!!!!!!!!!!")
                yield put(actions.getCurrShuffleTracksPageArr(true))
              }

              let currPage = yield call(getTracksPagesCount)
              yield put(actions.getNewShuffleTracksPageArr(currPage))

              const { payload: newArr } = yield take(
                actions.setNewShuffleTracksPageArr
              )
              if (isCurrentPagetheSamePageToPlay) {
                isCurrentPagetheSamePageToPlay = false
                yield put(actions.getCurrShuffleTracksPageArr(false))
              }

              const isObjHasArr = yield call(
                checkObjIncludesNextArr,
                shufflePages,
                currPage
              )
              if (!isObjHasArr) {
                const indexToDel = newArr.findIndex(
                  (node: HTMLDivElement) => node === null
                )

                let copy = newArr.slice(0, indexToDel)
                shufflePages[currPage] =
                  indexToDel !== -1 ? [...copy] : [...newArr]
              }

              yield put(actions.setAutoPlayingStatus())
              yield delay(50)

              const indexToDel = newArr.findIndex(
                (node: HTMLDivElement) => node === null
              )
              let copy = newArr.slice(0, indexToDel)

              const { i: nextIndex, origin: trackName } = yield call(
                chooseRandomTrack,
                shufflePages[currPage] ? shufflePages[currPage] : [...copy],
                shuffleSummary[+currPage]?.length
                  ? shuffleSummary[+currPage]
                  : undefined
              )

              newArr[nextIndex].click()
              yield delay(50)
              rest.playBtn.current.click()

              if (currPage !== pastPage) {
                if (shuffleSummary[+currPage]?.length) {
                  shufflePageChosenTracks = shuffleSummary[+currPage]
                } else {
                  shufflePageChosenTracks = []
                }
              }
              shufflePageChosenTracks.push(trackName)

              if (
                shufflePageChosenTracks.length ===
                  shufflePages[currPage].length &&
                +currPage === maxPagesCount - 1
              ) {
                pageFilled = pageFilled + 1
              }
              shuffleSummary[+currPage] = shufflePageChosenTracks

              pastPage = currPage
              iterCount++
              continue
            }
            const nextPage = yield call(
              chooseRandomPage,
              pagesCount,
              maxPagesCount,
              shuffleSummary,
              arr.length,
              shufflePages,
              pageFilled
            )

            if (nextPage === true) {
              iterCount = 0
              pastPage = ""
              pageFilled = 0
              shufflePageChosenTracks = []
              shuffleSummary = []
              shufflePages = {}

              closeBtn.click()
              yield take(actions.setShowPlaylistTracks)
              let currPage = yield call(getTracksPagesCount)

              for (let i = 0; i < +currPage; i++) {
                prevButton.click()
                yield delay(50)
              }
              currPage = yield call(getTracksPagesCount)
              yield put(actions.getNewShuffleTracksPageArr(`${currPage}`))
              const { payload: newArr } = yield take(
                actions.setNewShuffleTracksPageArr
              )
              yield delay(50)
              yield put(actions.setAutoPlayingStatus())
              yield delay(50)

              const indexToDel = newArr.findIndex(
                (node: HTMLDivElement) => node === null
              )
              let copy = newArr.slice(0, indexToDel)
              shufflePages[currPage] =
                indexToDel !== -1 ? [...copy] : [...newArr]

              const { i: nextIndex, origin: trackName } = yield call(
                chooseRandomTrack,
                shufflePages[currPage] ? shufflePages[currPage] : [...copy],
                shuffleSummary[+currPage]?.length
                  ? shuffleSummary[+currPage]
                  : undefined
              )
              newArr[nextIndex].click()
              yield delay(50)
              rest.playBtn.current.click()

              shufflePageChosenTracks.push(trackName)
              shuffleSummary[+currPage] = shufflePageChosenTracks

              continue
            }

            closeBtn.click()
            yield take(actions.setShowPlaylistTracks)
            yield delay(50)

            switch (pagesCount) {
              case "0":
                if (nextPage === 0) {
                  pastPage = pagesCount
                  isCurrentPagetheSamePageToPlay = true
                } else {
                  for (let i = 0; i < nextPage; i++) {
                    pastPage = pagesCount
                    nextButton.click()
                  }
                }

                break
              case "1":
                switch (nextPage) {
                  case 0:
                    for (let i = 0; i < +pagesCount; i++) {
                      pastPage = pagesCount
                      prevButton.click()
                    }
                    break
                  case 1:
                    pastPage = pagesCount
                    isCurrentPagetheSamePageToPlay = true
                    break
                  case 2:
                    for (let i = +pagesCount; i < nextPage; i++) {
                      pastPage = pagesCount
                      nextButton.click()
                    }
                    break
                  case 3:
                    for (let i = +pagesCount; i < nextPage; i++) {
                      nextButton.click()
                    }
                    break
                }
                break
              case "2":
                switch (nextPage) {
                  case 0:
                    for (let i = nextPage; i < +pagesCount; i++) {
                      pastPage = pagesCount
                      prevButton.click()
                    }
                    break
                  case 1:
                    for (let i = nextPage; i < +pagesCount; i++) {
                      pastPage = pagesCount
                      prevButton.click()
                    }
                    break
                  case 2:
                    pastPage = pagesCount
                    isCurrentPagetheSamePageToPlay = true
                    break
                  case 3:
                    for (let i = +pagesCount; i < nextPage; i++) {
                      pastPage = pagesCount
                      nextButton.click()
                    }
                    break
                }
                break
              case "3":
                if (nextPage === 3) {
                  pastPage = pagesCount
                  isCurrentPagetheSamePageToPlay = true
                } else {
                  for (let i = nextPage; i < +pagesCount; i++) {
                    prevButton.click()
                  }
                }
                break
            }

            if (isCurrentPagetheSamePageToPlay) {
              console.log("AAAAAAAAAAAAAAAAAAAA!!!!!!!!!!!!!!!!")
              yield put(actions.getCurrShuffleTracksPageArr(true))
            }
            yield put(actions.getNewShuffleTracksPageArr(`${nextPage}`))
            const { payload: newArr } = yield take(
              actions.setNewShuffleTracksPageArr
            )
            console.log("newArr", newArr)
            if (isCurrentPagetheSamePageToPlay) {
              isCurrentPagetheSamePageToPlay = false
              yield put(actions.getCurrShuffleTracksPageArr(false))
            }
            let currPage = yield call(getTracksPagesCount)

            const isObjHasArr = yield call(
              checkObjIncludesNextArr,
              shufflePages,
              currPage
            )
            if (!isObjHasArr) {
              const indexToDel = newArr.findIndex(
                (node: HTMLDivElement) => node === null
              )

              let copy = newArr.slice(0, indexToDel)
              shufflePages[currPage] =
                indexToDel !== -1 ? [...copy] : [...newArr]
            }

            yield delay(50)
            yield put(actions.setAutoPlayingStatus())
            yield delay(50)

            const indexToDel = newArr.findIndex(
              (node: HTMLDivElement) => node === null
            )
            let copy = newArr.slice(0, indexToDel)
            const { i: nextIndex, origin: trackName } = yield call(
              chooseRandomTrack,
              shufflePages[nextPage] ? shufflePages[nextPage] : [...copy],
              shuffleSummary[nextPage]?.length
                ? shuffleSummary[nextPage]
                : undefined
            )

            newArr[nextIndex].click()
            yield delay(50)
            rest.playBtn.current.click()

            if (shuffleSummary[+currPage]?.length) {
              shufflePageChosenTracks = shuffleSummary[+currPage]
            } else {
              shufflePageChosenTracks = []
            }
            shufflePageChosenTracks.push(trackName)

            if (
              shufflePageChosenTracks.length ===
                shufflePages[currPage].length &&
              +currPage === maxPagesCount - 1
            ) {
              pageFilled = pageFilled + 1
            }
            shuffleSummary[+currPage] = shufflePageChosenTracks

            pastPage = currPage
            continue
          }
        } while (isLoopTrue)
        console.log("loop end SHUFFLE")
      }
    } catch (e) {
      throw new Error(`КАКАЯ-ТО ХРЕНЬ В SHUFFLE: ${e}`)
    }
  }
}

export function* initializeSaga(): SagaIterator {
  while (true) {
    try {
      const { payload: playStatus } = yield take(actions.setTurnOnTracksPlay)
      yield put(actions.setTurnOnTracksPlay(true))

      if (playStatus) {
        const { payload: arr } = yield take(actions.setTracksArrToConstantPlay)
        arr[0].click()

        yield put(actions.setInitializePlaySuccess(true))
      } else {
        yield put(actions.setTurnOffTracksPlay(true))
        yield put(actions.setTrackOrderToPlay(""))

        // localStorage.setItem("stopLoopedPlay", "stop")
        continue
      }
    } catch (e) {
      throw new Error(`INITIALIZE InOrder SAGA ERROR: ${e}`)
    }
  }
}

export function* setPlaylistToPlaySaga(): SagaIterator {
  while (true) {
    console.log("common start")
    try {
      const { payload: isStartSuccess } = yield take(
        actions.setInitializePlaySuccess
      )
      setIsLoopTrue(true)
      if (isStartSuccess) {
        do {
          const tracksArrSize = yield call(getTracksArrSize)
          const pagesCount = yield call(getTracksPagesCount)
          console.log("local loop start")
          const {
            payload: playingStatus,
            meta: {
              i: currentTrackIndex,
              buttons: { prevButton, nextButton },
              arr,
              closeBtnRef: { current: closeBtn },
              ...rest
            },
          } = yield take(actions.setPlayingStatus)

          if (playingStatus === "closed") {
            console.log("!playingStatus")
            yield put(actions.setTurnOnTracksPlay(false))
            setIsLoopTrue(false)
            yield put(actions.setPlayingMode("single"))
            let currPage = yield call(getTracksPagesCount)
            yield put(actions.setTrackPage(+currPage))
            yield put(actions.setPlayStateAction(""))
            yield delay(100)
            // localStorage.removeItem("stopLoopedPlay")
            continue
          }

          // const isStoped = yield call(getStopStatus)
          // if (isStoped === "stop") {
          //   if (!playingStatus) {
          //     console.log("stop + ended")
          //     closeBtn.click()
          //     yield take(actions.setShowPlaylistTracks)
          //     yield delay(100)
          //     localStorage.removeItem("stopLoopedPlay")
          //     setIsLoopTrue(false)
          //     console.log("!!")
          //     continue
          //   }
          // }

          if (currentTrackIndex === 0) {
            trackIndex = pagesCount * arr.length
          }

          if (playingStatus === "ended") {
            trackIndex = trackIndex + 1

            if (trackIndex < +tracksArrSize) {
              closeBtn.click()
              yield take(actions.setShowPlaylistTracks)
              yield delay(100)

              if (currentTrackIndex === arr.length - 1) {
                nextButton.click()
                yield delay(50)
                yield put(actions.setAutoPlayingStatus())
                yield delay(50)
                arr[0].click()
                yield delay(50)
                rest.playBtn.current.click()
                continue
              }

              yield put(actions.setAutoPlayingStatus())
              yield delay(50)
              arr[currentTrackIndex + 1].click()
            } else {
              closeBtn.click()
              yield take(actions.setShowPlaylistTracks)
              yield delay(100)

              for (let i = 0; i < pagesCount; i++) {
                prevButton.click()
                yield delay(50)
              }
              trackIndex = 0
              yield put(actions.setAutoPlayingStatus())
              yield delay(50)
              arr[0].click()
              yield delay(50)
              rest.playBtn.current.click()
            }
          }
        } while (isLoopTrue)
        console.log("loop end")
      }
    } catch (e) {
      throw new Error(`КАКАЯ-ТО ХРЕНЬ: ${e}`)
    }
  }
}
