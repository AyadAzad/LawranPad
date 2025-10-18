import { DecoratorNode } from 'lexical'
import { createElement } from 'react'

export class ImageNode extends DecoratorNode {
  __src
  __altText
  __width
  __height

  static getType() {
    return 'image'
  }

  static clone(node) {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__key
    )
  }

  constructor(src, altText, width = '100%', height = 'auto', key) {
    super(key)
    this.__src = src
    this.__altText = altText || 'Image'
    this.__width = width
    this.__height = height
  }

  createDOM(config) {
    const div = document.createElement('div')
    div.className = config.theme.image || 'editor-image'
    return div
  }

  updateDOM() {
    return false
  }

  getSrc() {
    return this.__src
  }

  getAltText() {
    return this.__altText
  }

  getWidth() {
    return this.__width
  }

  getHeight() {
    return this.__height
  }

  setSrcAndAltText(src, altText) {
    const writable = this.getWritable()
    writable.__src = src
    writable.__altText = altText
  }

  decorate() {
    return createElement(ImageComponent, {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      nodeKey: this.getKey(),
    })
  }

  exportJSON() {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
    }
  }

  static importJSON(serializedNode) {
    const node = $createImageNode(
      serializedNode.src,
      serializedNode.altText,
      serializedNode.width,
      serializedNode.height
    )
    return node
  }
}

function ImageComponent({ src, altText, width, height, nodeKey }) {
  // Handle image loading errors
  const handleImageError = (event) => {
    console.error('Failed to load image:', src)
    event.target.style.display = 'none'
    const parent = event.target.parentElement
    const errorDiv = document.createElement('div')
    errorDiv.className = 'image-error'
    errorDiv.textContent = 'Failed to load image'
    errorDiv.style.cssText = `
      padding: 20px;
      background: #f3f4f6;
      border: 1px dashed #d1d5db;
      border-radius: 8px;
      text-align: center;
      color: #6b7280;
      margin: 1rem 0;
    `
    parent.appendChild(errorDiv)
  }

  // Handle image load success
  const handleImageLoad = (event) => {
    const errorDiv = event.target.parentElement.querySelector('.image-error')
    if (errorDiv) {
      errorDiv.remove()
    }
  }

  return (
    <div
      className="editor-image"
      data-lexical-decorator="true"
      data-node-key={nodeKey}
    >
      <img
        src={src}
        alt={altText}
        style={{
          width: width,
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '8px',
          display: 'block',
          margin: '1rem 0'
        }}
        draggable="false"
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  )
}

// Helper function to create image node
export function $createImageNode(src, altText = 'Image', width = '100%', height = 'auto') {
  return new ImageNode(src, altText, width, height)
}

// Type guard function to check if node is ImageNode
export function $isImageNode(node) {
  return node instanceof ImageNode
}
