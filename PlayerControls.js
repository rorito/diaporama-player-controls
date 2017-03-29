const React = require("react");
const { RENDER_EMPTY, RENDER_PLAYING, RENDER_WAITING } = require("diaporama");
const { Component } = React;

function lerp (min, max, x) {
  return (x-min) / (max-min);
}

class Button extends Component {
  constructor (props) {
    super(props);
    this.state = { hover: false };
    this.onClick = this.onClick.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }
  onClick (e) {
    const {onClick} = this.props;
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  }
  onMouseEnter () {
    this.setState({ hover: true });
  }
  onMouseLeave () {
    this.setState({ hover: false });
  }
  render () {
    const {
      children,
      icon,
      active
    } = this.props;
    const {
      hover
    } = this.state;

    const style = {
      color: active ? "#f1595a" : "#f1595a",
      fontSize: "22px",
      textDecoration: "none",
      padding: "0px 4px",
      verticalAlign: "top",
      cursor: "pointer",
      display: "inline-block",
      width: "24px",
      textAlign: "center"
    };
    return <a
      style={style}
      onClick={this.onClick}
      onMouseEnter={this.onMouseEnter}
      onMouseLeave={this.onMouseLeave}>
      {children || <i className={"fa fa-"+icon}></i> }
    </a>;
  }
}


const defaultProps = {
  Button: Button,
  loadingIcons: {
    [RENDER_EMPTY]: "fa fa-spinner",
    [RENDER_WAITING]: "fa fa-spinner fa-pulse",
    [RENDER_PLAYING]: "fa fa-spinner"
  },
  loadingOpacity: {
    [RENDER_EMPTY]: 0.5,
    [RENDER_WAITING]: 1,
    [RENDER_PLAYING]: 0
  },
  progressHeight: 8,
  styles: {
    style: {
      position: "relative",
      background: "#6dc7b6",
      opacity: 0.9,
      borderTop: "1px solid #6dc7b6"
    },
    progressContainer: {
      position: "relative",
      background: "#6dc7b6",
      cursor: "pointer",
      display: "block"
    },
    progress: {
      position: "absolute",
      top: 0,
      left: 0,
      height: "100%",
      background: "#f1595a",
      pointerEvents: "none"
    },
    buffered: {
      zIndex: 1,
      position: "absolute",
      top: 0,
      left: 0,
      height: "100%",
      background: "#ba2429",
      opacity: 0.3,
      pointerEvents: "none"
    },
    progressTime: {
      color: "#fff",
      fontWeight: "bold"
    },
    progressDuration: {
      paddingLeft: "4px",
      color: "#fff"
    },
    progressSlide: {
      color: "#fff",
      fontWeight: "bold",
      paddingLeft: "4px",
      paddingRight: "4px",
      display: "inline-block"
    },
    progressSlides: {
      paddingLeft: "4px",
      color: "#fff",
      paddingLeft: "4px",
      paddingRight: "4px",
      display: "inline-block"
    },
    textButton: {
      textTransform: "uppercase",
      fontSize: "10px",
      verticalAlign: "top"
    },
    loading: {
      position: "absolute",
      color: "#f1595a"
    },
    playbackRate: {
      color: "#999",
      fontSize: "1.2em"
    },
    buttons: {
      display: "flex",
      lineHeight: "32px",
      whiteSpace: "nowrap"
    },
    buttonsSection: {
      marginRight: "8px",
      fontSize: "12px",
      display: "block"
    },
    buttonsRight: {
      flex: 1,
      textAlign: "right",
      paddingRight: "4px"
    }
  }
};

class PlayerControls extends Component {
  constructor (props) {
    super(props);
    const { diaporama } = props;
    const refresh = () => this.forceUpdate();
    ["progress","destroy","error","play","pause","render","data"]
      .forEach(e => diaporama.on(e, refresh));

    this.onKeydown = this.onKeydown.bind(this);
    this.onProgressClick = this.onProgressClick.bind(this);
  }

  componentDidMount () {
    document.body.addEventListener("keydown", this.onKeydown);
  }

  componentWillUnmount () {
    document.body.removeEventListener("keydown", this.onKeydown);
  }

  formatDuration (d) {
    const secs = Math.floor(d / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return (m>9?m:"0"+m)+":"+(s>9?s:"0"+s);
  }

  onKeydown (e) {
    const { diaporama } = this.props;
    switch (e.which) {
    case 37: // Left
      e.preventDefault();
      diaporama.prev();
      break;
    case 39: // Right
      e.preventDefault();
      diaporama.next();
      break;
    case 32: // Space
      e.preventDefault();
      diaporama.paused = !diaporama.paused;
      break;
    }
  }

  onProgressClick (e) {
    e.preventDefault();
    const { diaporama } = this.props;
    var elementClicked = e.target;
    if (elementClicked.tagName !== "A") {
      // Sometimes target is the <i> tag, so we move to the parent <a> element
      elementClicked = elementClicked.parentElement;
    }
    const rect = elementClicked.getBoundingClientRect();
    diaporama.currentTime = diaporama.duration * lerp(rect.left, rect.right, e.clientX);
  }

  render () {
    const {
      Button,
      diaporama,
      diaporamaContainer,
      styles,
      loadingIcons,
      loadingOpacity,
      progressHeight,
      disableLoop,
      disableSlide,
      disableTime,
      disableProgress,
      disablePlayback,
      disablePlay
    } = this.props;
    const {
      loop,
      currentTime,
      duration,
      paused,
      playbackRate,
      slide,
      data,
      timeBuffered,
      currentRenderState
    } = diaporama;
    const slides = data && data.timeline.length || 0;

    const progressContainer = {
      ...styles.progressContainer,
      height: progressHeight+"px"
    };
    const loading = {
      ...styles.loading,
      opacity: loadingOpacity[currentRenderState],
      top: -(16 - progressHeight)/2,
      left: `${0.5 + 100 * currentTime / duration}%`
    };
    const buffered = {
      ...styles.buffered,
      width: `${100 * timeBuffered / duration}%`
    };
    const progress = {
      ...styles.progress,
      width: `${100 * currentTime / duration}%`
    };
    return <div style={styles.style}>
      {!disableProgress &&
      <a style={progressContainer} onClick={this.onProgressClick}>
        {/*<i style={loading} className={loadingIcons[currentRenderState]}></i>*/}
        <div style={buffered}></div>
        <div style={progress}></div>
      </a>
      }
      <div style={styles.buttons}>
        {!disablePlay &&
        <div style={styles.buttonsSection}>
          <Button onClick={() => diaporama.paused = !paused} icon={paused ? "play" : "pause"} />
        </div>
        }
        {!disableTime &&
        <div style={styles.buttonsSection}>
          <span style={styles.progressTime}>{this.formatDuration(currentTime)}</span>
          <span style={styles.progressDuration}>/</span>
          <span style={styles.progressDuration}>{this.formatDuration(duration)}</span>
        </div>
        }
        {!disableSlide &&
        <div style={styles.buttonsSection}>
          <Button onClick={() => diaporama.prev()} icon="step-backward" />
          <span style={styles.progressSlide}>{slide+1}</span>
          <span style={styles.progressSlides}>/</span>
          <span style={styles.progressSlides}>{slides}</span>
          <Button onClick={() => diaporama.next()} icon="step-forward" />
        </div>
        }
        {!disablePlayback &&
        <div style={styles.buttonsSection}>
          <Button onClick={() => { diaporama.playbackRate /= 2; this.forceUpdate(); }} icon="backward" />
          <span style={styles.playbackRate}>{0.001 * Math.round(playbackRate * 1000)}x</span>
          <Button onClick={() => { diaporama.playbackRate *= 2; this.forceUpdate(); }} icon="forward" />
        </div>
        }
        {!disableLoop &&
        <div style={styles.buttonsRight}>
          <Button onClick={() => { diaporama.loop = !loop; this.forceUpdate(); }} togglable active={loop}>
            <span style={styles.textButton}>loop</span>
          </Button>
        </div>
        }
        <div style={styles.buttonsRight}>
          <Button onClick={() => toggleFullscreen(diaporamaContainer)} icon="expand"/>
        </div>
      </div>
    </div>;
  }
}

const toggleFullscreen = diaporamaContainer => {
  if (document.fullscreenElement || document.webkitFullscreenElement ||
    document.mozFullScreenElement || document.msFullscreenElement) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  } else {
    const element = document.getElementById(diaporamaContainer);
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }
}

PlayerControls.defaultProps = defaultProps;

PlayerControls.init = (dom, props) => {
  React.render(<PlayerControls {...props} />, dom);
};

module.exports = PlayerControls;
