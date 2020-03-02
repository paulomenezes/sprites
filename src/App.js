import React, { Component } from 'react';

import sprite from './sprite.png';

export default class App extends Component {
  state = {
    width: 200,
    height: 189,
    rectangles: [],
  };

  componentDidMount() {
    const image = this.refs.image;

    image.onload = () => {
      const canvas = this.refs.canvas;
      this.rect = canvas.getBoundingClientRect(); // abs. size of element
      this.scaleX = canvas.width / this.rect.width; // relationship bitmap vs. element for X
      this.scaleY = canvas.height / this.rect.height; // relationship bitmap vs. element for Y

      this.reload();
    };
  }

  reload() {
    const canvas = this.refs.canvas;
    const context = canvas.getContext('2d');
    const image = this.refs.image;

    context.clearRect(0, 0, image.clientWidth, image.clientHeight);
    context.drawImage(image, 0, 0);

    context.strokeStyle = 'red';
    context.beginPath();
    context.rect(0, 0, +this.state.width, +this.state.height);
    context.stroke();

    const width = +this.state.width;
    const height = +this.state.height;

    console.log(width, height, this.state);
    let startLine = 0;
    let endLine = 0;
    let newLine = false;

    const rows = [];
    const columns = [];

    this.setState({
      rectangles: [],
    });

    for (let y = 0; y < 200; y++) {
      let line = true;
      for (let x = 0; x < width; x++) {
        const pixelData = context.getImageData(x, y, 1, 1).data;
        if (pixelData[0] !== 0 && pixelData[1] !== 0 && pixelData[2] !== 0 && pixelData[3] !== 0) {
          line = false;
          break;
        }
      }

      if (line && newLine) {
        startLine = y;
        endLine = y;
        newLine = false;
      }

      if (line && !newLine) {
        endLine = y;
      }

      if (!line && !newLine) {
        newLine = true;
        const middle = startLine + Math.floor((endLine - startLine) / 2);
        console.log(startLine, endLine, middle);

        // context.strokeStyle = 'blue';
        // context.beginPath();
        // context.moveTo(0, middle);
        // context.lineTo(width, middle);
        // context.stroke();

        rows.push([0, middle, width, middle]);
      }
    }

    startLine = 0;
    endLine = 0;
    newLine = false;

    for (let x = 0; x < width; x++) {
      let line = true;
      for (let y = 0; y < 200; y++) {
        const pixelData = context.getImageData(x, y, 1, 1).data;
        if (pixelData[0] !== 0 && pixelData[1] !== 0 && pixelData[2] !== 0 && pixelData[3] !== 0) {
          line = false;
          break;
        }
      }

      if (line && newLine) {
        startLine = x;
        endLine = x;
        newLine = false;
      }

      if (line && !newLine) {
        endLine = x;
      }

      if ((!line && !newLine) || x === width - 1) {
        newLine = true;
        const middle = startLine + Math.floor((endLine - startLine) / 2);
        console.log(startLine, endLine, middle);

        // context.strokeStyle = 'blue';
        // context.beginPath();
        // context.moveTo(middle, 0);
        // context.lineTo(middle, height);
        // context.stroke();

        columns.push([middle, 0, middle, height]);
      }
    }

    console.log(rows);
    console.log(columns);
    const points = [];

    for (const row of rows) {
      for (const column of columns) {
        // console.log(row, column, this.intersects(...row, ...column));
        const x1 = row[0];
        const y1 = row[1];

        const x2 = row[2];
        const y2 = row[3];

        const x3 = column[0];
        const y3 = column[1];

        const x4 = column[2];
        const y4 = column[3];

        const pX =
          ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
          ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

        const pY =
          ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
          ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

        // console.log(row, column, pX, pY);

        points.push([pX, pY]);
      }
    }

    console.log(points);
    const rectangles = [];

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      let distances = [];

      const found = [false, false, false];
      for (const p of points) {
        const dx = p[0] - point[0];
        const dy = p[1] - point[1];

        if ((!found[0] && dx > 0 && dy > 0) || (!found[1] && dx === 0 && dy > 0) || (!found[2] && dx > 0 && dy === 0)) {
          if (dx > 0 && dy > 0) {
            found[0] = true;
          }
          if (dx === 0 && dy > 0) {
            found[1] = true;
          }
          if (dx > 0 && dy === 0) {
            found[2] = true;
          }

          distances.push({
            d: this.distance(point[0], point[1], p[0], p[1]),
            p,
          });
        }

        if (found[0] && found[1] && found[2]) {
          break;
        }
      }
      if (distances.length < 2 || point[0] === distances[2].p[0]) {
        continue;
      }

      distances.sort((a, b) => a.d - b.d);

      rectangles.push([point[0], point[1], distances[2].p[0] - point[0], distances[2].p[1] - point[1]]);
    }

    console.log(rectangles);
    this.setState({
      rectangles,
    });

    // for (const rectangle of rectangles) {
    //   context.strokeStyle = 'blue';
    //   context.beginPath();
    //   context.rect(rectangle[0], rectangle[1], rectangle[2], rectangle[3]);
    //   context.stroke();

    //   // context.strokeStyle = 'blue';
    //   // context.beginPath();
    //   // context.rect(rectangle[0], rectangle[1], 2, 2);
    //   // context.stroke();

    //   // context.strokeStyle = 'red';
    //   // context.beginPath();
    //   // context.rect(rectangle[2], rectangle[3], 2, 2);
    //   // context.stroke();
    // }
  }

  distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  intersects(a, b, c, d, p, q, r, s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
    }
  }

  render() {
    return (
      <div style={{ display: 'flex' }}>
        <canvas
          ref='canvas'
          width={500}
          height={window.innerHeight}
          onMouseMove={event => {
            // console.log(this.state.rectangles, event.clientX, event.clientY);

            const canvas = this.refs.canvas;
            const context = canvas.getContext('2d');

            const x = (event.clientX - this.rect.left) * this.scaleX; // scale mouse coordinates after they have
            const y = (event.clientY - this.rect.top) * this.scaleY; // been adjusted to be relative to element

            // const x = event.clientX;
            // const y = event.clientY;

            // context.strokeStyle = 'red';
            // context.beginPath();
            // context.rect(x, y, 2, 2);
            // context.stroke();

            for (const rectangle of this.state.rectangles) {
              if (
                x >= rectangle[0] &&
                x <= rectangle[0] + rectangle[2] &&
                y >= rectangle[1] &&
                y <= rectangle[1] + rectangle[3]
              ) {
                // console.log(rectangle);
                context.beginPath();
                context.rect(rectangle[0], rectangle[1], rectangle[2], rectangle[3]);
                context.stroke();
                break;
              }
            }
            // const pixelData = this.refs.canvas.getContext('2d').getImageData(event.clientX, event.clientY, 1, 1).data;
            // console.log(pixelData);
          }}
        />
        <div>
          <div>
            <label>Width: {this.state.width}</label>
            <input
              type='number'
              value={this.state.width}
              onChange={event => {
                this.setState({ width: event.target.value }, this.reload);
              }}
            />
          </div>
          <div>
            <label>Height: {this.state.height}</label>
            <input
              type='number'
              value={this.state.height}
              onChange={event => {
                this.setState({ height: event.target.value }, this.reload);
              }}
            />
          </div>
        </div>
        <img ref='image' src={sprite} alt='sprite' style={{ visibility: 'hidden' }} />
      </div>
    );
  }
}
