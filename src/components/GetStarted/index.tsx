import React, { useRef } from "react"
import { connect } from "react-redux"
import { bindActionCreators, Dispatch } from "redux"
import { RootAction, RootState } from "../../store/rootReducer"
import * as playerActions from "../../store/actions"
import Music from "../AudioPlayer"
import song01 from "./01.mp3"
import song02 from "./02.mp3"
import song03 from "./03.mp3"

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const mapStateToProps = (state: RootState) => ({
  oldVolValueToProps: state.play.volValue,
  oldCurrTimeToProps: state.play.currTime,
})
const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      setOldVolValue: (payload) => playerActions.savingVolValue(payload),
      setOldCurrTime: (payload) => playerActions.savingCurrTime(payload),
    },
    dispatch
  )

const GetStarted: React.FC<Props> = ({
  setOldVolValue,
  oldVolValueToProps,
  setOldCurrTime,
  oldCurrTimeToProps,
}) => {
  const [timeInputValueCurrent, setTimeInputValueCurrent] = React.useState("0")
  const [totalTimeDuration, setTotalTimeDuration] = React.useState(0)

  const [totalMinDuration, setTotalMinDuration] = React.useState(0)
  const [secBalanceDuration, setSecBalanceDuration] = React.useState(0)
  const [currMinTime, setCurrMinTime] = React.useState("00")
  const [currSecBalanceTime, setCurrSecBalanceTime] = React.useState("00")

  const [volInputValue, setVolInputValue] = React.useState(0)
  const [volTrack, setVolTrack] = React.useState(0)
  const [volLoopValue, setLoopValue] = React.useState(false)
  const [volMute, setVolMute] = React.useState(false)

  const ref: any = useRef()
  const refVolRange: any = useRef()
  const refTimeRange: any = useRef()

  React.useEffect(() => {
    const audioTrack1 = ref.current
    const volRanger = refVolRange.current
    const timeRanger = refTimeRange.current

    audioTrack1.loop = volLoopValue
    audioTrack1.volume = volTrack
    audioTrack1.currentTime = timeInputValueCurrent
//  console.log("+", oldCurrTimeToProps)

    audioTrack1.ontimeupdate = (e: any) => {
      timeRanger.min = "0"
      timeRanger.max = `${totalTimeDuration}`
      timeRanger.value = e.target.currentTime.toFixed(0)

      // setOldCurrTime(e.target.currentTime.toFixed(0))
      // console.log("1", timeInputValueCurrent)
      // console.log("2", e.target.currentTime.toFixed(0))

      ;(function timeDivider(currSec: string, counter: string = "00"): any {
        let newCounterValue = 60 * (+counter + 1)
        if (+currSec < newCounterValue) {
          if (+currSec < 60) {
            setCurrMinTime(`${+counter}`.padStart(2, counter))
            setCurrSecBalanceTime(`${+currSec}`.padStart(2, "00"))
          } else if (+currSec === 60) {
            setCurrSecBalanceTime("00")
          } else {
            setCurrSecBalanceTime(`${+currSec - 60 * +counter}`.padStart(2, "00"))
          }
        }
        if (+currSec >= +totalTimeDuration - 1) {
          setCurrMinTime(`${Math.trunc(+currSec / 60)}`.padStart(2, "00"))
          return
        }
        if (+currSec >= newCounterValue - 1 && +currSec !== 0) {
          setCurrMinTime(`${+counter + 1}`.padStart(2, "00"))
          return timeDivider(
            `${+currSec + 1}`,
            `${+counter + 1}`.padStart(2, counter)
          )
        }
      })(e.target.currentTime.toFixed(0))
    }

    // ;(function timeDivider(currSec: string, counter: string = "00"): any {
    //   let newCounterValue = 60 * (+counter + 1)
    //   if (+currSec < newCounterValue) {
    //     if (+currSec < 60) {
    //       setCurrMinTime(`${+counter}`.padStart(2, counter))
    //       setCurrSecBalanceTime(`${+currSec}`.padStart(2, "00"))
    //     } else if (+currSec === 60) {
    //       setCurrSecBalanceTime("00")
    //     } else {
    //       setCurrSecBalanceTime(`${+currSec - 60 * +counter}`.padStart(2, "00"))
    //     }
    //   }
    //   if (+currSec >= +totalTimeDuration - 1) {
    //     setCurrMinTime(`${Math.trunc(+currSec / 60)}`.padStart(2, "00"))
    //     return
    //   }
    //   if (+currSec >= newCounterValue - 1 && +currSec !== 0) {
    //     setCurrMinTime(`${+counter + 1}`.padStart(2, "00"))
    //     return timeDivider(
    //       `${+currSec + 1}`,
    //       `${+counter + 1}`.padStart(2, counter)
    //     )
    //   }
    // })(timeInputValueCurrent)

    // timeRanger.onchange = () => {
    //   setOldCurrTime(timeRanger.value)
    // }

    // volRanger.onchange = (e: any) => {
    //   console.log("3", oldCurrTimeToProps)
    //   setOldCurrTime(audioTrack1.currentTime)
    //   console.log("4", oldCurrTimeToProps)
    // }
  }, [
    volTrack,
    volLoopValue,
    totalTimeDuration,
    timeInputValueCurrent,
    oldCurrTimeToProps,
    setOldCurrTime,
  ])

  const volValueHandler = (e: any) => {
    let newVal = (e.target.value / 100).toFixed(2)
    setOldVolValue(newVal)
  }

  const volValueChanger = (e: any) => {
    let newVal = +(e.target.value / 100).toFixed(2)
    setVolTrack(newVal)
    setVolInputValue(e.target.value)
  }

  const timeValueChanger = (e: any) => {
    e.target.min = "0"
    e.target.max = `${totalTimeDuration}`
    setTimeInputValueCurrent(e.target.value)
    // setOldCurrTime(e.target.value)
  }

  const loopInstall = () => {
    setLoopValue(!volLoopValue)
  }

  const muteInstall = () => {
    if (!volMute) {
      setVolTrack(0)
      setVolInputValue(0)
    } else {
      setVolTrack(oldVolValueToProps)
      setVolInputValue(oldVolValueToProps * 100)
    }
    setVolMute(!volMute)
  }

  const loadTrackDuration = (e: any) => {
    setTotalMinDuration(Math.trunc(e.target.duration / 60))
    setSecBalanceDuration(
      Math.round(e.target.duration - Math.trunc(e.target.duration / 60) * 60)
    )
    setTotalTimeDuration(e.target.duration)
  }

  

  return (
    <main id="login">
      <div className="container-fluid">
        <div className="row">
          <div className="col" style={{ minWidth: "600px" }}>
            <div className="row">
              <div className="col">
                <audio
                  controls
                  src={song01}
                  ref={ref}
                  onLoadedData={loadTrackDuration}
                />
              </div>
              <div className="col">
                <div className="row">
                  <div className="col">
                    <p>{`TotalTime: ${totalMinDuration} min ${secBalanceDuration} sec`}</p>
                  </div>
                  <div className="col">
                    <p>{`CurrentTime: ${currMinTime} min ${currSecBalanceTime} sec`}</p>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <button onClick={loopInstall}>LoopTrack</button>
                  </div>
                  <div className="col">
                    <button onClick={muteInstall}>Mute</button>
                  </div>
                  <div className="col">
                    <p>CurrentVolume: {volInputValue}</p>
                  </div>
                </div>
                <div className="row">
                  <div className="col px-3">
                    <div className="row">
                      <div className="col">
                        <div>TimeRange:</div>
                        <input
                          ref={refTimeRange}
                          id="timeRange"
                          type="range"
                          value={timeInputValueCurrent}
                          onInput={timeValueChanger}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col px-3">
                    <div>VolumeRange:</div>{" "}
                    <input
                      id="volumeRange"
                      type="range"
                      ref={refVolRange}
                      value={volInputValue}
                      onChange={volValueHandler}
                      onInput={volValueChanger}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <audio controls src={song02} />
              </div>
            </div>
            <div className="row">
              <div className="col">
                <audio src={song03} />
              </div>
            </div>

            <Music url={song01} />
          </div>
        </div>
      </div>
    </main>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(GetStarted))
