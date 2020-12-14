import React, { SetStateAction } from "react"
import { bindActionCreators, Dispatch } from "redux"
import { RootAction, RootState } from "../../store/rootReducer"
import * as playerActions from "../../store/actions"
import { connect } from "react-redux"
import { CSSTransition } from "react-transition-group"
import { Button, Alert } from "react-bootstrap"

interface State {
  play: boolean
  totalTimeDuration: number
  totalMinDuration: number
  secBalanceDuration: number
  currMinTime: string
  currSecBalanceTime: string
  volInputValue: number
  volTrack: number
  volLoopValue: boolean
  volMute: boolean
}

type AudioElementEvent<T> = React.SyntheticEvent<HTMLAudioElement, Event> & {
  duration: number
  target: T
}

interface TrackProps {
  src: string
}

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  TrackProps

const mapStateToProps = (state: RootState) => ({
  oldVolValueToProps: state.play.volValue,
})
const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      setOldVolValue: (payload) => playerActions.savingVolValue(payload),
    },
    dispatch
  )

var i = 0
let ctx, x_end, y_end, bar_height
const bars = 50
const radius = 0
const bar_width = 20
const browserInterfaceDiffWidth = 30
const browserInterfaceDiffHeight = 100

class Music extends React.PureComponent<Props, State> {
  // audio: globalThis.HTMLAudioElement
  source: any
  analyser: any
  frequency_array: any
  canvas: React.RefObject<HTMLCanvasElement>
  rafId!: number
  audioRef: React.RefObject<HTMLAudioElement>
  refVolRange: React.RefObject<HTMLInputElement>
  refTimeRange: React.RefObject<HTMLInputElement>
  audioTrack1!: HTMLAudioElement | null
  timeRanger!: HTMLInputElement | null

  constructor(props: Props) {
    super(props)

    this.state = {
      play: false,
      totalTimeDuration: 0,
      totalMinDuration: 0,
      secBalanceDuration: 0,
      currMinTime: "00",
      currSecBalanceTime: "00",
      volInputValue: 20,
      volTrack: 0.2,
      volLoopValue: false,
      volMute: false,
    }
    // this.audio = new Audio(this.props.src)
    this.canvas = React.createRef()
    this.audioRef = React.createRef()
    this.refVolRange = React.createRef()
    this.refTimeRange = React.createRef()

    this.trackOnTimeUpdate = this.trackOnTimeUpdate.bind(this)
    this.timeDivider = this.timeDivider.bind(this)
    this.volValueHandler = this.volValueHandler.bind(this)
    this.loopInstall = this.loopInstall.bind(this)
    this.muteInstall = this.muteInstall.bind(this)
  }

  componentDidMount() {
    this.audioTrack1 = this.audioRef.current
    this.timeRanger = this.refTimeRange.current
    this.audioTrack1!.addEventListener("ended", () =>
      this.setState({ play: false })
    )

    this.context = new AudioContext()
    this.source = this.context.createMediaElementSource(this.audioTrack1)
    this.analyser = this.context.createAnalyser()
    this.source.connect(this.analyser)
    this.analyser.connect(this.context.destination)
    this.frequency_array = new Uint8Array(this.analyser.frequencyBinCount)
  }
  componentDidUpdate() {
    this.audioTrack1!.loop = this.state.volLoopValue
    this.audioTrack1!.volume = this.state.volTrack
  }

  componentWillUnmount() {
    this.audioTrack1!.removeEventListener("ended", () =>
      this.setState({ play: false })
    )
    cancelAnimationFrame(this.rafId)
    this.analyser.disconnect()
    this.source.disconnect()
  }

  animationLooper(canvas: any) {
    let width = (canvas.width = window.innerWidth - browserInterfaceDiffWidth)
    let height = (canvas.height =
      window.innerHeight - browserInterfaceDiffHeight)
    let center_x = width / 2 + browserInterfaceDiffWidth / 2
    let center_y = height / 2 + browserInterfaceDiffHeight / 2
    ctx = canvas.getContext("2d")

    for (var i = 0; i < bars; i++) {
      //divide a circle into equal part
      const rads = (Math.PI * 2) / bars

      // Math is magical
      bar_height = this.frequency_array[i] * 1.33
      let x = center_x + Math.cos(rads * i) * (radius + bar_height / 2)
      let y = center_y + Math.sin(rads * i) * (radius + bar_height / 2)
      x_end = center_x + Math.cos(rads * i) * (radius + bar_height)
      y_end = center_y + Math.sin(rads * i) * (radius + bar_height)

      //draw a bar
      this.drawBar(x, y, x_end, y_end, this.frequency_array[i], ctx, canvas)
    }
  }

  drawBar(
    x1 = 0,
    y1 = 0,
    x2 = 0,
    y2 = 0,
    frequency: number,
    ctx: {
      createLinearGradient: (
        arg0: number,
        arg1: number,
        arg2: number,
        arg3: number
      ) => any
      fillStyle: any
      strokeStyle: string | undefined
      lineWidth: number
      beginPath: () => void
      moveTo: (arg0: number, arg1: number) => void
      lineTo: (arg0: number, arg1: number) => void
      stroke: () => void
      closePath: () => void
      clearRect: (
        arg0: number,
        arg1: number,
        arg2: number,
        arg3: number
      ) => void
    },
    canvas: { width: number; height: number }
  ) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "white")
    gradient.addColorStop(1, "green")
    ctx.fillStyle = gradient

    let lineColor
    if (frequency < 75) {
      if (this.state.play) {
        i = i + 1
        if (i / 10 < 40) {
          lineColor = `rgb(${238},${10},${230}` // ярко-фиолетовый
        }
        if (i / 10 >= 40 && i / 10 < 120) {
          lineColor = `rgb(${0},${120},${250}` // голубой
        }
        if (i / 10 >= 120 && i / 10 < 260) {
          lineColor = `rgb(${34},${217},${0}` // зеленый
        }
        if (i / 10 >= 260 && i / 10 < 380) {
          lineColor = `rgb(${255},${138},${0}` // оранженый
        }
        if (i / 10 > 380) {
          lineColor = `rgb(${255},${0},${0}` // насыщенный красный
        }
        if (i / 10 === 500) {
          i = 0
        }
      }
    } else if (frequency >= 75 && frequency < 120) {
      if (i / 10 >= 120 && i / 10 < 260) {
        lineColor = `rgb(${184},${250},${220}` // бирюзовый (светло-зеленый+светло-голубой)
      } else {
        lineColor = `rgb(${184 * Math.random()},${250},${220}`
      }
    } else if (frequency >= 120 && frequency < 160) {
      if (i / 10 >= 260 && i / 10 < 380) {
        lineColor = `rgb(${229},${209},${228})` // светло-фиолетовый
      } else {
        lineColor = `rgb(${10 * frequency * Math.random()},${
          2 * frequency * Math.random()
        },${5 * frequency * Math.random()})`
      }
    } else {
      lineColor = `rgb(${238},${230},${10})` // желтый
    }

    ctx.strokeStyle = lineColor
    ctx.lineWidth = bar_width
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.closePath()

    if (!this.state.play) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  tick = () => {
    this.animationLooper(this.canvas.current)
    this.analyser.getByteTimeDomainData(this.frequency_array)
    this.rafId = requestAnimationFrame(this.tick)
  }

  togglePlay = () => {
    this.setState({ play: !this.state.play }, () => {
      if (this.state.play) {
        // this.audio.play()
        this.rafId = requestAnimationFrame(this.tick)
        this.audioTrack1?.play()
      } else {
        // this.audio.pause()
        cancelAnimationFrame(this.rafId)
        this.audioTrack1?.pause()
      }
    })
  }

  volValueHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let newVal: string = (+e.target.value / 100).toFixed(2)
    this.props.setOldVolValue(newVal)
    this.setState({ volTrack: +newVal })
    this.setState({ volInputValue: +e.target.value })
  }

  loopInstall = () => {
    this.setState({ volLoopValue: !this.state.volLoopValue })
    console.log(this.state.volLoopValue)
  }

  muteInstall = () => {
    if (!this.state.volMute) {
      this.props.setOldVolValue(+(this.state.volInputValue / 100).toFixed(2))
      this.setState({ volTrack: 0 })
      this.setState({ volInputValue: 0 })
      this.setState({ volMute: !this.state.volMute })
    } else {
      this.setState({ volTrack: this.props.oldVolValueToProps })
      this.setState({ volInputValue: this.props.oldVolValueToProps * 100 })
      this.setState({ volMute: !this.state.volMute })
    }
  }

  loadTrackDuration = (e: AudioElementEvent<HTMLAudioElement>): void => {
    this.setState({ totalMinDuration: Math.trunc(e.target.duration / 60) })
    this.setState({
      secBalanceDuration: Math.round(
        e.target.duration - Math.trunc(e.target.duration / 60) * 60
      ),
    })
    this.setState({ totalTimeDuration: e.target.duration })
  }

  timeDivider(currSec: string, counter: string | undefined = "00"): any {
    let newCounterValue = 60 * (+counter + 1)
    if (+currSec < newCounterValue) {
      if (+currSec < 60) {
        this.setState({ currMinTime: `${+counter}`.padStart(2, counter) })
        this.setState({ currSecBalanceTime: `${+currSec}`.padStart(2, "00") })
      } else if (+currSec === 60) {
        this.setState({ currSecBalanceTime: "00" })
      } else {
        this.setState({
          currSecBalanceTime: `${+currSec - 60 * +counter}`.padStart(2, "00"),
        })
      }
    }
    if (+currSec >= +this.state.totalTimeDuration - 1) {
      this.setState({
        currMinTime: `${Math.trunc(+currSec / 60)}`.padStart(2, "00"),
      })
      return
    }
    if (+currSec >= newCounterValue - 1 && +currSec !== 0) {
      this.setState({ currMinTime: `${+counter + 1}`.padStart(2, "00") })
      return this.timeDivider(
        `${+currSec + 1}`,
        `${+counter + 1}`.padStart(2, counter)
      )
    }
  }

  trackOnTimeUpdate = (e: AudioElementEvent<HTMLAudioElement>): void => {
    this.timeRanger!.value = e.target.currentTime.toFixed(0)

    this.timeDivider(e.target.currentTime.toFixed(0))

    this.timeRanger!.onchange = (e: any) => {
      this.audioTrack1!.currentTime = +e.target!.value
    }
  }

  render() {
    return (
      <>
        <button onClick={this.togglePlay}>
          {this.state.play ? "Pause" : "Play"}
        </button>
        <canvas ref={this.canvas} />
        <div className="col">
          <audio
            src={this.props.src}
            ref={this.audioRef}
            onLoadedMetadata={this.loadTrackDuration}
            onTimeUpdate={this.trackOnTimeUpdate}
          />
        </div>
        <div className="col">
          <div className="row">
            <div className="col">
              <p>{`TotalTime: ${this.state.totalMinDuration} min ${this.state.secBalanceDuration} sec`}</p>
            </div>
            <div className="col">
              <p>{`CurrentTime: ${this.state.currMinTime} min ${this.state.currSecBalanceTime} sec`}</p>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <button onClick={this.loopInstall}>LoopTrack</button>
            </div>
            <div className="col">
              <button onClick={this.muteInstall}>Mute</button>
            </div>
            <div className="col">
              <p>CurrentVolume: {this.state.volInputValue}</p>
            </div>
          </div>
          <div className="row">
            <div className="col px-3">
              <div className="row">
                <div className="col">
                  <div>TimeRange:</div>
                  <input
                    ref={this.refTimeRange}
                    id="timeRange"
                    type="range"
                    min="0"
                    max={this.state.totalTimeDuration}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col px-3">
              <div>VolumeRange:</div>
              <input
                id="volumeRange"
                type="range"
                ref={this.refVolRange}
                value={this.state.volInputValue}
                onChange={this.volValueHandler}
              />
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Music)
