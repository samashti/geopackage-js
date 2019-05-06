import fileType from 'file-type'
import {Duplex} from 'stream'
import {Writable} from 'stream'
import TileCreator from './tileCreator'
import PureImage from 'pureimage'

class NodeTileCreator extends TileCreator {
  constructor(width, height, tileMatrix, tileMatrixSet, tileBoundingBox, projectionFrom, projectionTo, canvas) {
    super(width, height, tileMatrix, tileMatrixSet, tileBoundingBox, projectionFrom, projectionTo, canvas)
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
  async addTile(tileData, gridColumn, gridRow) {
    var type = fileType(tileData);
    var stream = new Duplex();
    stream.push(tileData);
    stream.push(null);
    var decodeFunction = type.ext === 'png' ? PureImage.decodePNGFromStream : PureImage.decodeJPEGFromStream;
    const img = await decodeFunction(stream)
    this.tile = img;
    this.chunks = [];
    await this.projectTile(tileData, gridColumn, gridRow);
    if (this.pixels && this.pixels.length) {
      this.pixels.forEach(function (pixel) {
        this.canvas.setPixelRGBA(pixel.x, pixel.y, pixel.color);
      }.bind(this));
    }
    if (this.chunks && this.chunks.length) {
      for (const chunk of this.chunks) {
        var type = fileType(chunk.chunk);
        var chunkStream = new Duplex();
        chunkStream.push(tileData);
        chunkStream.push(null);
        var image = await decodeFunction(chunkStream);
        var p = chunk.position;
        this.ctx.drawImage(image, p.sx, p.sy, p.sWidth, p.sHeight, p.dx, p.dy, p.dWidth, p.dHeight);
      }
    }
    return this.canvas;
  }
  async getCompleteTile(format) {
    var stream = new Writable();
    var buffers = [];
    stream._write = function (chunk, enc, next) {
      buffers.push(chunk);
      next();
    };
    if (format === 'jpg') {
      await PureImage.encodeJPEGToStream(this.canvas, stream)
      return Buffer.concat(buffers);
    }
    else {
      await PureImage.encodePNGToStream(this.canvas, stream)
      return Buffer.concat(buffers);
    }
  }
}

export default NodeTileCreator
