import React from "react"

interface classProps {
  url: string
}

interface AudioReturn {
  play: boolean
}

var i = 0
let ctx, x_end, y_end, bar_height
const bars = 50
const radius = 0
const bar_width = 20
const browserInterfaceDiffWidth = 30
const browserInterfaceDiffHeight = 100

export class Music extends React.PureComponent<classProps, AudioReturn> {
  audio: globalThis.HTMLAudioElement
  source: any
  analyser: any
  frequency_array: any
  canvas: React.RefObject<HTMLCanvasElement>
  rafId!: number

  constructor(props: classProps) {
    super(props)
    this.state = {
      play: false,
    }
    this.audio = new Audio(this.props.url)
    this.canvas = React.createRef()
  }

  componentDidMount() {
    this.audio.addEventListener("ended", () => this.setState({ play: false }))

    this.context = new AudioContext()
    this.source = this.context.createMediaElementSource(this.audio)
    this.analyser = this.context.createAnalyser()
    this.source.connect(this.analyser)
    this.analyser.connect(this.context.destination)
    this.frequency_array = new Uint8Array(this.analyser.frequencyBinCount)
  }

  componentWillUnmount() {
    this.audio.removeEventListener("ended", () =>
      this.setState({ play: false })
    )
    cancelAnimationFrame(this.rafId)
    this.analyser.disconnect()
    this.source.disconnect()
  }

  animationLooper(canvas: any) {
    let width = (canvas.width = window.innerWidth - browserInterfaceDiffWidth)
    let height = (canvas.height = window.innerHeight - browserInterfaceDiffHeight)
    let center_x = width / 2 + browserInterfaceDiffWidth/2
    let center_y = height / 2 + browserInterfaceDiffHeight/2
    ctx = canvas.getContext("2d")

    for (var i = 0; i < bars; i++) {
      //divide a circle into equal part
      const rads = (Math.PI * 2) / bars

      // Math is magical
      // bar_height = this.frequency_array[i] * 3
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
        arg3: number,
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
        this.audio.play()
        this.rafId = requestAnimationFrame(this.tick)
      } else {
        this.audio.pause()
        cancelAnimationFrame(this.rafId)
      }
    })
  }

  render() {
    return (
      <>
        <button onClick={this.togglePlay}>
          {this.state.play ? "Pause" : "Play"}
        </button>
        <canvas ref={this.canvas} />
      </>
    )
  }
}

export default Music
