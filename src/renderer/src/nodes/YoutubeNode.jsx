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
    div.className = config.theme.youtube || 'video-embed'
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
}

function YouTubeComponent({ videoId, nodeKey }) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}`

  return (
    <div className="video-embed" data-lexical-decorator="true">
      <iframe
        src={embedUrl}
        width="100%"
        height="400"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
        style={{
          borderRadius: '8px',
          border: 'none'
        }}
      />
    </div>
  )
}

export function $createYouTubeNode(videoId) {
  return new YoutubeNode(videoId)
}

export function $isYouTubeNode(node) {
  return node instanceof YoutubeNode
}
