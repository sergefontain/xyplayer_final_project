import React from "react"
import { bindActionCreators, Dispatch } from "redux"
import { RootAction, RootState } from "../../store/rootReducer"
import * as actions from "../../store/actions"
import { connect } from "react-redux"
import { Button, Row, Col, Image } from "react-bootstrap"
import Marquee from "react-double-marquee"
import volRotatorImg from "./rotator.png"
import { TrackResolver } from "../GetPlaylists"

interface State {
  play: boolean
  totalTimeDuration: number
  totalMinDuration: number
  secBalanceDuration: number
  currMinTime: string
  currSecBalanceTime: string
  volTrack: number | undefined
  volLoopValue: boolean
  volMute: boolean
  rotatorVal: number
}

type AudioElementEvent<T> = React.SyntheticEvent<HTMLAudioElement, Event> & {
  duration: number
  target: T
}

interface TrackProps {
  src: string
  title: string | undefined
  originName: string
  playState: boolean
  setShowButton: React.Dispatch<React.SetStateAction<boolean>>
  index?: number | undefined
  arr?: Array<HTMLDivElement> | undefined
  buttonsArr?: TrackResolver["buttonsArr"] | undefined
  closeBtnRef?: TrackResolver["closeBtnRef"] | undefined
  setShowMessage: React.Dispatch<React.SetStateAction<string>>
  setPlayState?: React.Dispatch<React.SetStateAction<boolean>> | undefined
  // isPlayDone?: boolean | undefined
  setIsSingleMode?: React.Dispatch<React.SetStateAction<boolean>> | undefined
  isSingleMode?: boolean | undefined
  nextImg: string
}

const mapStateToProps = (state: RootState) => ({
  oldVolValueToProps: state.play.volValue,
  oldCurrTime: state.play.currTime,
  turnOnTracksPlay: state.play.turnOnTracksPlay,
  orderPlay: state.main.trackOrderToPlay,
  playingStatus: state.play.playingStatus,
})
const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      setOldVolValue: (payload) => actions.savingVolValue(payload),
      setPlayingStatus: (payload, meta) =>
        actions.setPlayingStatus(payload, meta),
      setShowPlaylistTracks: (payload) =>
        actions.setShowPlaylistTracks(payload),
      setOldCurrTime: (payload) => actions.setPlayerCurrTime(payload),
      setPlayingMode: (payload) => actions.setPlayingMode(payload),
      setTrackPlayState: (payload) => actions.setPlayStateAction(payload),
    },
    dispatch
  )

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  TrackProps

var i = 0
let ctx, x_end, y_end, bar_height
const bars = 50
const radius = 0
const bar_width = 20
let canvasH = 600
let canvasW = 900
let rotValue = 0
let rotStep = 1

class Music extends React.PureComponent<Props, State> {
  canvas: React.RefObject<HTMLCanvasElement>
  audioRef: React.RefObject<HTMLAudioElement>
  refVolRange: React.RefObject<HTMLInputElement>
  refTimeRange: React.RefObject<HTMLInputElement>
  volLevText: React.RefObject<HTMLDivElement>
  imgRef: React.RefObject<HTMLImageElement>
  playerSlideRef: React.RefObject<HTMLImageElement>
  playBtn: React.MutableRefObject<HTMLButtonElement | null>
  audioTrack1: HTMLAudioElement | null | undefined
  timeRanger: HTMLInputElement | null | undefined
  canvasElement: HTMLCanvasElement | null | undefined
  rotator: HTMLImageElement | null | undefined
  playerSlide: HTMLImageElement | null | undefined
  volLevContainer: HTMLDivElement | null | undefined
  rafId!: number
  rotMin!: number
  rotMax!: number
  rotMinAngle!: number
  rotMaxAngle!: number
  source!: MediaElementAudioSourceNode
  analyser!: AnalyserNode
  frequency_array!: Uint8Array
  ratio: number
  isFirefox: boolean

  constructor(props: Props) {
    super(props)

    this.state = {
      play: false,
      totalTimeDuration: 0,
      totalMinDuration: 0,
      secBalanceDuration: 0,
      currMinTime: "00",
      currSecBalanceTime: "00",
      volTrack: undefined,
      volLoopValue: false,
      volMute: false,
      rotatorVal: 20,
    }
    this.canvas = React.createRef()
    this.audioRef = React.createRef()
    this.refVolRange = React.createRef()
    this.refTimeRange = React.createRef()
    this.imgRef = React.createRef()
    this.volLevText = React.createRef()
    this.playBtn = React.createRef()
    this.playerSlideRef = React.createRef()

    this.rotMin = 0
    this.rotMax = 100
    this.rotMinAngle = -135
    this.rotMaxAngle = 135

    this.isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1

    this.ratio =
      (this.rotMaxAngle - this.rotMinAngle) / (this.rotMax - this.rotMin)
  }

  componentDidMount() {
    this.playerSlide = this.playerSlideRef.current
    this.canvasElement = this.canvas.current
    this.audioTrack1 = this.audioRef.current
    this.timeRanger = this.refTimeRange.current
    this.volLevContainer = this.volLevText.current
    this.rotator = this.imgRef.current

    this.setState({ volTrack: +this.state.rotatorVal / 100 })
    this.setVolValue(+this.state.rotatorVal)

    if (this.props.playState) {
      if (this.audioTrack1) {
        this.audioTrack1.play()
      }
    }
    if (this.props.oldVolValueToProps) {
      this.setState({
        rotatorVal: +(this.props.oldVolValueToProps * 100).toFixed(0),
      })
      this.setState({ volTrack: this.props.oldVolValueToProps })
      this.setVolValue(+(this.props.oldVolValueToProps * 100).toFixed(0))
    }

    if (this.volLevContainer) {
      this.volLevContainer.style.color = "teal"
      this.volLevContainer.style.textShadow = "1px -1px 4px #119600"
    }
    if (this.canvasElement) {
      this.canvasElement.width = 0
      this.canvasElement.height = 0
    }

    if (this.audioTrack1) {
      this.audioTrack1.crossOrigin = "anonymous"
      this.audioTrack1.addEventListener("play", this.onTrackPlay)
      this.audioTrack1.addEventListener("ended", this.onTrackEnded)
    }
    if (this.rotator) {
      this.rotator.width = 100
      this.rotator.height = 100
      this.rotator.style.transform = `rotate(${this.getRotAngle()}deg)`

      this.rotator.addEventListener("click", this.onClick)
      this.rotator.addEventListener("wheel", this.onWheel)
      this.rotator.addEventListener("dragstart", this.onRotatorDragStart)
    }
    if (this.playerSlide) {
      this.playerSlide.addEventListener("dragstart", this.onSlideDragStart)
    }
    if (this.timeRanger) {
      this.timeRanger.addEventListener("change", this.onChange)
    }

    this.context = new AudioContext()
    this.source = this.context.createMediaElementSource(this.audioTrack1)
    this.analyser = this.context.createAnalyser()
    this.source.connect(this.analyser)
    this.analyser.connect(this.context.destination)
    this.frequency_array = new Uint8Array(this.analyser.frequencyBinCount)
  }

  componentDidUpdate() {
    if (this.audioTrack1) {
      this.audioTrack1.loop = this.state.volLoopValue
      if (this.state.volTrack) {
        this.audioTrack1.volume = this.state.volTrack
      }
    }
    if (this.volLevContainer) {
      if (this.state.rotatorVal <= 33) {
        this.volLevContainer.style.color = "teal"
        this.volLevContainer.style.textShadow = "1px -1px 4px #119600"
      }
      if (this.state.rotatorVal > 33) {
        this.volLevContainer.style.color = "#ffc107"
        this.volLevContainer.style.textShadow = "1px -1px 4px #FFB905"
      }
      if (this.state.rotatorVal > 66) {
        this.volLevContainer.style.color = "#dc3545"
        this.volLevContainer.style.textShadow = "1px -1px 4px #FF0511"
      }
    }
  }

  componentWillUnmount() {
    if (this.audioTrack1) {
      this.audioTrack1.removeEventListener("play", this.onTrackPlay)
      this.audioTrack1.removeEventListener("ended", this.onTrackEnded)
    }
    if (this.rotator) {
      this.rotator.removeEventListener("click", this.onClick)
      this.rotator.removeEventListener("wheel", this.onWheel)
      this.rotator.removeEventListener("dragstart", this.onRotatorDragStart)
    }
    if (this.playerSlide) {
      this.playerSlide.removeEventListener("dragstart", this.onSlideDragStart)
    }
    if (this.timeRanger) {
      this.timeRanger.removeEventListener("change", this.onChange)
    }
    cancelAnimationFrame(this.rafId)
    this.analyser.disconnect()
    this.source.disconnect()
  }

  onTrackPlay = (): void => {
    this.setState({ play: true })
    this.rafId = requestAnimationFrame(this.tick)
    if (this.canvasElement) {
      this.canvasElement.width = canvasW
      this.canvasElement.height = canvasH
    }
  }

  onTrackEnded = (): void => {
    this.setState({ play: false })
    cancelAnimationFrame(this.rafId)
    if (this.canvasElement) {
      this.canvasElement.width = 0
      this.canvasElement.height = 0
    }
    this.props.setShowMessage("")
    this.props.setShowButton(true)
    this.props.setTrackPlayState("")

    if (this.props.arr?.length) {
      this.props.setPlayingStatus(
        // this.props.isPlayDone ||
        this.props.isSingleMode ? "" : "ended",
        {
          i: this.props.index,
          arr: this.props.arr,
          buttons:
            this.props.buttonsArr !== undefined &&
            this.props.buttonsArr["prevButton"] !== null &&
            this.props.buttonsArr["nextButton"] !== null
              ? {
                  prevButton: this.props.buttonsArr.prevButton,
                  nextButton: this.props.buttonsArr.nextButton,
                }
              : { prevButton: null, nextButton: null },
          closeBtnRef: this.props.closeBtnRef,
          playBtn: this.playBtn,
        }
      )
      if (
        this.props.setPlayState !== undefined &&
        this.props.isSingleMode !== undefined
      ) {
        this.props.setPlayState(false)
      }
      if (
        this.props.setPlayState !== undefined &&
        // this.props.isPlayDone &&
        this.props.setIsSingleMode !== undefined
      ) {
        this.props.setPlayState(false)
        this.props.setIsSingleMode(true)
      }
      this.props.setShowPlaylistTracks(true)
    } else {
      this.props.setPlayingStatus("ended", undefined)
    }
  }

  onClick = (e: MouseEvent): void => {
    if (this.rotator) {
      const { left, width } = this.rotator.getBoundingClientRect()

      if (e.clientX - left < width / 2) {
        let x = rotValue + rotStep
        if (!(x > this.rotMax)) {
          this.setVolValue(x)
          this.setState({
            rotatorVal: x,
          })
          this.setState({ volTrack: +x / 100 })
          this.props.setOldVolValue(+(x / 100).toFixed(2))
        } else {
          return
        }
      } else {
        let x = rotValue - rotStep
        if (!(x <= this.rotMin)) {
          this.setVolValue(x)
          this.setState({
            rotatorVal: x,
          })
          this.setState({ volTrack: +x / 100 })
          this.props.setOldVolValue(+(x / 100).toFixed(2))
        } else {
          return
        }
      }
    }
  }

  onChange = (e: Event): void => {
    const target = e.target as HTMLInputElement
    if (this.audioTrack1) {
      this.audioTrack1.currentTime = +target.value
    }
  }

  onWheel = (e: WheelEvent): void => {
    /*
     ** деление на 3, чтобы исключить фактор влияния deltaY(в фаерфокс, deltaY == 3) на шаг изменения угла,
     ** сделать зависимым шаг исключительно от величины step
     ** деление на 100, чтобы исключить фактор влияния deltaY на шаг изменения угла, сделать зависимым шаг
     ** исключительно от величины step
     */
    let x = rotValue + (e.deltaY / (this.isFirefox ? 3 : 100)) * rotStep
    if (x <= this.rotMin) {
      this.setVolValue(0)
      this.setState({
        rotatorVal: 0,
      })
      this.setState({ volTrack: 0 })
      this.props.setOldVolValue(0)
    } else if (x > this.rotMax) {
      this.setVolValue(100)
      this.setState({
        rotatorVal: 100,
      })
      this.setState({ volTrack: 1 })
      this.props.setOldVolValue(1)
    } else {
      this.setVolValue(x)
      this.setState({
        rotatorVal: x,
      })
      this.setState({ volTrack: +x / 100 })
      this.props.setOldVolValue(+(x / 100).toFixed(2))
    }
    e.preventDefault()
  }

  onRotatorDragStart = (): boolean => {
    return false
  }
  onSlideDragStart = (): boolean => {
    return false
  }

  setVolValue = (newValue: number): void => {
    rotValue = newValue
    if (this.rotator) {
      this.rotator.style.transform = `rotate(${this.getRotAngle()}deg)`
    }
  }

  getRotAngle = (): number =>
    (rotValue - this.rotMin) * this.ratio + this.rotMinAngle

  animationLooper(canvas: HTMLCanvasElement): void {
    let width = (canvas.width = canvasW)
    let height = (canvas.height = canvasH)
    let center_x = width / 2
    let center_y = height / 2
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
    ctx: CanvasRenderingContext2D | null,
    canvas: { width: number; height: number }
  ): void {
    const gradient: CanvasGradient = ctx!.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    )
    gradient.addColorStop(0, "white")
    gradient.addColorStop(1, "green")
    if (ctx) {
      ctx.fillStyle = gradient
    }

    let lineColor = ""
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

    if (ctx) {
      ctx.strokeStyle = lineColor
      ctx.lineWidth = bar_width
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.closePath()
    }

    if (!this.state.play) {
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  tick = (): void => {
    this.animationLooper(this.canvasElement!)
    this.analyser.getByteTimeDomainData(this.frequency_array)
    this.rafId = requestAnimationFrame(this.tick)
  }

  togglePlay = (): void => {
    this.setState({ play: !this.state.play }, () => {
      if (this.state.play) {
        this.rafId = requestAnimationFrame(this.tick)
        if (this.canvasElement) {
          this.canvasElement.width = canvasW
          this.canvasElement.height = canvasH
        }
        if (this.props.setPlayState !== undefined) {
          this.props.setPlayState(true)
        }
        if (this.audioTrack1) {
          this.audioTrack1.play()
        }
      } else {
        cancelAnimationFrame(this.rafId)
        if (this.canvasElement) {
          this.canvasElement.width = 0
          this.canvasElement.height = 0
        }
        if (this.audioTrack1) {
          this.audioTrack1.pause()
        }
      }
    })
  }

  loopInstall = (): void => {
    this.setState({ volLoopValue: !this.state.volLoopValue })
  }

  muteInstall = (): void => {
    if (!this.state.volMute) {
      this.props.setOldVolValue(+(this.state.rotatorVal / 100).toFixed(2))
      this.setVolValue(0)
      this.setState({ volMute: !this.state.volMute })
      this.setState({ volTrack: 0.01 })
      this.setState({ rotatorVal: 0 })
    } else {
      this.setVolValue(this.props.oldVolValueToProps * 100)
      this.setState({ volMute: !this.state.volMute })
      this.setState({ volTrack: this.props.oldVolValueToProps })
      this.setState({ rotatorVal: this.props.oldVolValueToProps * 100 })
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

  timeDivider(currSec: string, counter: string | undefined = "00"): void {
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
    if (this.timeRanger) {
      this.timeRanger.value = e.target.currentTime.toFixed(0)
    }
    this.timeDivider(e.target.currentTime.toFixed(0))
  }

  render() {
    return (
      <Row className="ml-0">
        <Col
          sm={12}
          md={12}
          lg={12}
          xl={6}
          className="d-flex flex-column justify-content-between"
        >
          <Row
            className=""
            style={{
              position: "absolute",
              zIndex: 1,
              top: "15px",
              left: "30px",
              width: "100%",
            }}
          >
            <Col
              className={
                this.state.play
                  ? "d-flex align-items-center mt-3 pr-0"
                  : "mt-3 pr-0"
              }
            >
              <div className="p-2 bg-light" style={{ width: "min-content" }}>
                <Button
                  onClick={this.togglePlay}
                  variant={this.state.play ? "warning" : "outline-danger"}
                  className="px-5"
                  ref={(elem: HTMLButtonElement | null) =>
                    elem ? (this.playBtn.current = elem) : null
                  }
                >
                  {this.state.play ? "PAUSE" : "PLAY"}
                </Button>
              </div>
            </Col>
            {this.state.play ? (
              <Col className="mt-3 mr-5 ml-3 bg-white">
                <div
                  className="pr-3 text-warning font-weight-bold text-outline-grey"
                  style={{
                    fontSize: "1.2rem",
                  }}
                >
                  Now playing:
                </div>
                <div
                  className="text-monospace text-outline-green"
                  style={{
                    maxWidth: "200px",
                    whiteSpace: "nowrap",
                    fontSize: "1.1rem",
                    color: "green",
                  }}
                >
                  <Marquee
                    delay={1000}
                    speed={0.02}
                    direction="left"
                    childMargin={100}
                  >
                    {this.props.title
                      ? this.props.title
                      : this.props.originName}
                  </Marquee>
                </div>
              </Col>
            ) : null}
          </Row>
          <Row>
            <Col className="my-2 px-0">
              <Image
                src={this.props.nextImg}
                style={{ position: "relative", width: "100%" }}
                fluid
                ref={this.playerSlideRef}
              />
              {this.state.play ? (
                <div className="beforePicMiddleLayer"></div>
              ) : null}
              <canvas
                ref={this.canvas}
                style={{
                  width: "100%",
                  height: "auto",
                  position: "absolute",
                  left: 0,
                  top: "18%",
                }}
              />
              <audio
                src={`/${this.props.src}`}
                ref={this.audioRef}
                onLoadedMetadata={this.loadTrackDuration}
                onTimeUpdate={this.trackOnTimeUpdate}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={12} sm={12} md={12} lg={12} xl={6} className="d-flex">
          <Row className="justify-content-center flex-grow-1">
            <Col className="d-flex align-items-center">
              <Row className="flex-grow-1 d-flex">
                <Col
                  sm={8}
                  md={6}
                  lg={6}
                  xl={8}
                  className="trackControlPanel rounded d-flex flex-column flex-grow-1"
                  style={{
                    background: "#D4D8DB",
                    height: "min-content",
                  }}
                >
                  <Row>
                    <Col
                      className="timeScreen mt-2 mx-3"
                      style={{ lineHeight: "2rem" }}
                    >
                      <span className="fs1rmd titleTimeScreen px-2">
                        CurrentTime:
                      </span>
                      <div className="fs2rmd pb-2">
                        {this.state.currMinTime} min{" "}
                        {this.state.currSecBalanceTime} sec
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col
                      className="additionalScreen mb-3 mx-3"
                      style={{ lineHeight: "1rem" }}
                    >
                      <span className="fs1m additionalTitle px-3">
                        TotalTime:
                      </span>
                      <div className="fs1rmd d-inline-block py-3 px-2 text-monospace">
                        {this.state.totalMinDuration} min{" "}
                        {this.state.secBalanceDuration} sec
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="d-flex border border-warning p-0 mx-3 mb-2 pr-2 align-items-center">
                      <div className="timeLineTitle mx-3 d-inline-block px-3">
                        TimeLine:
                      </div>
                      <div className="d-inline-flex align-items-center flex-grow-1 py-2">
                        <input
                          ref={this.refTimeRange}
                          id="timeRange"
                          type="range"
                          min="0"
                          max={this.state.totalTimeDuration}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row className="my-5 mx-2">
                    <Col className="d-flex flex-column align-items-center justify-content-center">
                      <Row>
                        <Col>
                          <Row>
                            <Col className="d-flex border border-info mb-2 bg-white p-0">
                              <div
                                className="fs2rmd"
                                ref={this.volLevText}
                                style={{ width: "100px", textAlign: "center" }}
                              >
                                {this.state.rotatorVal.toFixed(0)}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col
                              className="d-flex flex-column align-items-center pb-2"
                              style={{
                                lineHeight: "1rem",
                                fontWeight: "bolder",
                              }}
                            >
                              <span>Volume</span> <span>Level</span>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Col>

                    <Col className="d-flex flex-column justify-content-center">
                      <Row>
                        <Col className="d-flex flex-column align-items-center border border-dark bg-secondary rounded-pill py-2 mx-3">
                          <img
                            ref={this.imgRef}
                            src={volRotatorImg}
                            alt=""
                            className="rounded-circle"
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="d-flex mb-3 mx-3 p-0 justify-content-between">
                      {!this.state.volLoopValue ? (
                        <Button
                          onClick={this.loopInstall}
                          size="lg"
                          variant="outline-success"
                          style={{ width: "30%" }}
                        >
                          Loop
                        </Button>
                      ) : (
                        <Button
                          onClick={this.loopInstall}
                          size="lg"
                          variant="success"
                          style={{ width: "30%" }}
                        >
                          Looped
                        </Button>
                      )}
                      {!this.state.volMute ? (
                        <Button
                          onClick={this.muteInstall}
                          size="lg"
                          variant="outline-dark"
                          style={{ width: "30%" }}
                        >
                          Mute
                        </Button>
                      ) : (
                        <Button
                          onClick={this.muteInstall}
                          size="lg"
                          variant="dark"
                          style={{ width: "30%" }}
                        >
                          Muted
                        </Button>
                      )}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Music)
