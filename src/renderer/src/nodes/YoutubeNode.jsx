import { DecoratorNode } from 'lexical'
import { createElement } from 'react'

export class YoutubeNode extends DecoratorNode {
  __videoId

  static getType() {
    return 'youtube'
  }

  static clone(node) {
    return new YoutubeNode(node.__videoId, node.__key)
  }

  constructor(videoId, key) {
    super(key)
    this.__videoId = videoId
  }

  createDOM(config) {
    const div = document.createElement('div')
    div.className = config.theme.youtube || 'video-embed responsive'
    div.style.width = '100%'
    return div
  }

  updateDOM() {
    return false
  }

  getVideoId() {
    return this.__videoId
  }

  setVideoId(videoId) {
    this.getWritable().__videoId = videoId
  }

  decorate() {
    return createElement(YouTubeComponent, {
      videoId: this.__videoId,
      nodeKey: this.getKey(),
    })
  }

  exportJSON() {
    return {
      type: 'youtube',
      version: 1,
      videoId: this.__videoId,
    }
  }

  static importJSON(serializedNode) {
    const node = $createYouTubeNode(serializedNode.videoId)
    return node
  }

  exportDOM() {
    const element = document.createElement('div')
    element.className = 'video-embed responsive'

    const iframe = document.createElement('iframe')
    iframe.src = `https://www.youtube.com/embed/${this.__videoId}`
    iframe.width = '100%'
    iframe.height = '400'
    iframe.frameBorder = '0'
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
    iframe.allowFullScreen = true
    iframe.title = 'YouTube video'
    iframe.style.borderRadius = '8px'
    iframe.style.border = 'none'

    element.appendChild(iframe)
    return { element }
  }
}

function YouTubeComponent({ videoId, nodeKey }) {
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`

  return (
    <div
      className="video-embed responsive"
      data-lexical-decorator="true"
      data-node-key={nodeKey}
    >
      <iframe
        src={embedUrl}
        width="100%"
        height="400"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        title="YouTube video"
        style={{
          borderRadius: '8px',
          border: 'none'
        }}
        referrerPolicy="no-referrer"
      />
      <div style={{
        fontSize: '12px',
        color: '#666',
        marginTop: '8px',
        textAlign: 'center'
      }}>
        YouTube Video: {videoId}
      </div>
    </div>
  )
}

export function $createYouTubeNode(videoId) {
  return new YoutubeNode(videoId)
}

export function $isYouTubeNode(node) {
  return node instanceof YoutubeNode
}
