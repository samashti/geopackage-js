import fileType from 'file-type'
import {Duplex} from 'stream'
import {Writable} from 'stream'
import TileCreator from './tileCreator'
import PureImage from 'pureimage'

class NodeTileCreator extends TileCreator {
  constructor(width, height, tileMatrix, tileMatrixSet, tileBoundingBox, projectionFrom, projectionTo, canvas) {
    super(width, height, tileMatrix, tileMatrixSet, tileBoundingBox, srs, projectionTo, canvas)
    this.pixels = [];
    this.canvas = canvas || PureImage.make(this.width, this.height);
    this.ctx = this.canvas.getContext('2d');
  }
  addPixel(targetX, targetY, sourceX, sourceY) {
    this.pixels.push({
      x: targetX,
      y: targetY,
      color: this.tile.getPixelRGBA(sourceX, sourceY)
    });
  }
  addTile(tileData, gridColumn, gridRow) {
    var type = fileType(tileData);
    var stream = new Duplex();
    stream.push(tileData);
    stream.push(null);
    var decodeFunction = type.ext === 'png' ? PureImage.decodePNGFromStream : PureImage.decodeJPEGFromStream;
    return decodeFunction(stream)
      .then(function (img) {
        this.tile = img;
        this.chunks = [];
      }.bind(this))
      .then(function () {
        return this.projectTile(tileData, gridColumn, gridRow);
      }.bind(this))
      .then(function () {
        if (this.pixels && this.pixels.length) {
          this.pixels.forEach(function (pixel) {
            this.canvas.setPixelRGBA(pixel.x, pixel.y, pixel.color);
          }.bind(this));
        }
      }.bind(this))
      .then(function () {
        if (this.chunks && this.chunks.length) {
          return this.chunks.reduce(function (sequence, chunk) {
            return sequence.then(function () {
              var type = fileType(chunk.chunk);
              var image = this.image;
              var chunkStream = new Duplex();
              chunkStream.push(tileData);
              chunkStream.push(null);
              return decodeFunction(chunkStream);
            }.bind(this))
              .then(function (image) {
                var p = chunk.position;
                this.ctx.drawImage(image, p.sx, p.sy, p.sWidth, p.sHeight, p.dx, p.dy, p.dWidth, p.dHeight);
              }.bind(this));
          }.bind(this), Promise.resolve());
        }
      }.bind(this))
      .then(function () {
        return this.canvas;
      }.bind(this));
  }
  getCompleteTile(format) {
    var stream = new Writable();
    var buffers = [];
    stream._write = function (chunk, enc, next) {
      buffers.push(chunk);
      next();
    };
    if (format === 'jpg') {
      return PureImage.encodeJPEGToStream(this.canvas, stream)
        .then(function () {
          return Buffer.concat(buffers);
        });
    }
    else {
      return PureImage.encodePNGToStream(this.canvas, stream)
        .then(function () {
          return Buffer.concat(buffers);
        });
    }
  }
}

export default NodeTileCreator
