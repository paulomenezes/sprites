import React, { Component } from "react";

import sprite from "./sprite.png";

export default class App extends Component {
  state = {
    width: 200,
    height: 189,
    moves: [],
    newMove: 5,
    rectangles: [],
    hoverRectangle: -1,
    selectedRectangle: -1,
    hoverMoveRectangleI: -1,
    hoverMoveRectangleJ: -1,
    selectMoveRectangleI: -1,
    selectMoveRectangleJ: -1,
    canvas: null,
    context: null
  };

  componentDidMount() {
    const image = this.refs.image;

    image.onload = () => {
      const canvas = this.refs.canvas;
      const context = canvas.getContext("2d");

      this.setState({
        canvas,
        context
      });

      this.rect = canvas.getBoundingClientRect(); // abs. size of element
      this.scaleX = canvas.width / this.rect.width; // relationship bitmap vs. element for X
      this.scaleY = canvas.height / this.rect.height; // relationship bitmap vs. element for Y

      this.updateRectangles();
    };
  }

  componentDidUpdate() {
    this.reload();
  }

  updateRectangles() {
    const context = this.state.context;
    const image = this.refs.image;

    context.clearRect(0, 0, image.clientWidth, image.clientHeight);
    context.drawImage(image, 0, 0);

    const width = +this.state.width;
    const height = +this.state.height;

    context.strokeStyle = "red";
    context.beginPath();
    context.rect(0, 0, width, height);
    context.stroke();

    console.log(width, height, this.state);
    let startLine = 0;
    let endLine = 0;
    let newLine = false;

    const rows = [];
    const columns = [];

    this.setState({
      rectangles: []
    });

    for (let y = 0; y < 200; y++) {
      let line = true;
      for (let x = 0; x < width; x++) {
        const pixelData = context.getImageData(x, y, 1, 1).data;
        if (
          pixelData[0] !== 0 &&
          pixelData[1] !== 0 &&
          pixelData[2] !== 0 &&
          pixelData[3] !== 0
        ) {
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
        if (
          pixelData[0] !== 0 &&
          pixelData[1] !== 0 &&
          pixelData[2] !== 0 &&
          pixelData[3] !== 0
        ) {
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

        if (
          (!found[0] && dx > 0 && dy > 0) ||
          (!found[1] && dx === 0 && dy > 0) ||
          (!found[2] && dx > 0 && dy === 0)
        ) {
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
            p
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

      rectangles.push([
        point[0],
        point[1],
        distances[2].p[0] - point[0],
        distances[2].p[1] - point[1]
      ]);
    }

    console.log(rectangles);
    this.setState({
      rectangles
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

  reload() {
    const context = this.state.context;
    const image = this.refs.image;

    context.clearRect(0, 0, this.state.canvas.width, this.state.canvas.height);
    context.drawImage(image, 0, 0);

    const width = +this.state.width;
    const height = +this.state.height;

    context.strokeStyle = "red";
    context.beginPath();
    context.rect(0, 0, width, height);
    context.stroke();

    if (this.state.hoverRectangle > -1) {
      context.strokeStyle = "blue";
      context.beginPath();
      context.rect(
        this.state.rectangles[this.state.hoverRectangle][0],
        this.state.rectangles[this.state.hoverRectangle][1],
        this.state.rectangles[this.state.hoverRectangle][2],
        this.state.rectangles[this.state.hoverRectangle][3]
      );
      context.stroke();
    }

    // if (this.state.selectedRectangle > -1) {
    //   context.strokeStyle = "red";
    //   context.beginPath();
    //   context.rect(
    //     this.state.rectangles[this.state.selectedRectangle][0],
    //     this.state.rectangles[this.state.selectedRectangle][1],
    //     this.state.rectangles[this.state.selectedRectangle][2],
    //     this.state.rectangles[this.state.selectedRectangle][3]
    //   );
    //   context.stroke();
    // }

    for (let i = 0; i < this.state.moves.length; i++) {
      const move = this.state.moves[i];

      context.fillText(move.name, move.x, move.y);

      for (let j = 0; j < move.sizes.length; j++) {
        if (
          this.state.selectMoveRectangleI === i &&
          this.state.selectMoveRectangleJ === j
        ) {
          context.strokeStyle = "red";
        } else if (
          this.state.hoverMoveRectangleI === i &&
          this.state.hoverMoveRectangleJ === j
        ) {
          context.strokeStyle = "blue";
        } else {
          context.strokeStyle = "black";
        }

        context.beginPath();
        context.rect(move.sizes[j].x, move.sizes[j].y, move.width, move.height);
        context.stroke();

        if (move.sizes[j].rectangle > -1) {
          const imageData = this.state.context.getImageData(
            this.state.rectangles[move.sizes[j].rectangle][0],
            this.state.rectangles[move.sizes[j].rectangle][1],
            this.state.rectangles[move.sizes[j].rectangle][2],
            this.state.rectangles[move.sizes[j].rectangle][3]
          );

          this.state.context.putImageData(
            imageData,
            move.sizes[j].x,
            move.sizes[j].y
          );
        }
      }
    }
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
      <div style={{ display: "flex" }}>
        <canvas
          ref="canvas"
          width={500}
          height={window.innerHeight}
          onMouseMove={event => {
            if (!this.rect) {
              return;
            }

            const x = (event.clientX - this.rect.left) * this.scaleX;
            const y = (event.clientY - this.rect.top) * this.scaleY;

            this.setState({
              hoverRectangle: -1,
              hoverMoveRectangleI: -1,
              hoverMoveRectangleJ: -1
            });

            for (let i = 0; i < this.state.rectangles.length; i++) {
              const rectangle = this.state.rectangles[i];
              if (
                x >= rectangle[0] &&
                x <= rectangle[0] + rectangle[2] &&
                y >= rectangle[1] &&
                y <= rectangle[1] + rectangle[3]
              ) {
                this.setState({ hoverRectangle: i });
                break;
              }
            }

            for (let i = 0; i < this.state.moves.length; i++) {
              const move = this.state.moves[i];
              for (let j = 0; j < move.sizes.length; j++) {
                const size = move.sizes[j];

                if (
                  x >= size.x &&
                  x <= size.x + move.width &&
                  y >= size.y &&
                  y <= size.y + move.height
                ) {
                  this.setState({
                    hoverMoveRectangleI: i,
                    hoverMoveRectangleJ: j
                  });
                  break;
                }
              }
            }
          }}
          onMouseDown={event => {
            if (!this.rect) {
              return;
            }

            const x = (event.clientX - this.rect.left) * this.scaleX;
            const y = (event.clientY - this.rect.top) * this.scaleY;

            for (let i = 0; i < this.state.rectangles.length; i++) {
              const rectangle = this.state.rectangles[i];
              if (
                x >= rectangle[0] &&
                x <= rectangle[0] + rectangle[2] &&
                y >= rectangle[1] &&
                y <= rectangle[1] + rectangle[3]
              ) {
                console.log(
                  this.state.selectMoveRectangleI,
                  this.state.selectMoveRectangleJ,
                  i
                );
                // this.setState(prevState => ({
                //   selectMoveRectangleI: -1,
                //   selectMoveRectangleJ: -1
                //   // selectedRectangle: prevState.selectedRectangle === i ? -1 : i
                // }));

                const imageData = this.state.context.getImageData(
                  rectangle[0],
                  rectangle[1],
                  rectangle[2],
                  rectangle[3]
                );

                const moves = Array.from(this.state.moves);
                if (
                  this.state.moves[this.state.selectMoveRectangleI].width <
                  imageData.width
                ) {
                  moves[this.state.selectMoveRectangleI].width =
                    imageData.width;
                }

                if (
                  this.state.moves[this.state.selectMoveRectangleI].height <
                  imageData.height
                ) {
                  moves[this.state.selectMoveRectangleI].height =
                    imageData.height;
                }

                moves[this.state.selectMoveRectangleI].sizes[
                  this.state.selectMoveRectangleJ
                ].rectangle = i;

                this.setState({
                  moves
                });
                break;
              }
            }

            for (let i = 0; i < this.state.moves.length; i++) {
              const move = this.state.moves[i];
              for (let j = 0; j < move.sizes.length; j++) {
                const size = move.sizes[j];

                if (
                  x >= size.x &&
                  x <= size.x + move.width &&
                  y >= size.y &&
                  y <= size.y + move.height
                ) {
                  this.setState({
                    selectMoveRectangleI: i,
                    selectMoveRectangleJ: j
                  });
                  break;
                }
              }
            }
          }}
        />
        <div>
          <div>
            <label>Width: {this.state.width}</label>
            <input
              type="number"
              value={this.state.width}
              onChange={event => {
                this.setState(
                  { width: event.target.value },
                  this.updateRectangles
                );
              }}
            />
          </div>
          <div>
            <label>Height: {this.state.height}</label>
            <input
              type="number"
              value={this.state.height}
              onChange={event => {
                this.setState(
                  { height: event.target.value },
                  this.updateRectangles
                );
              }}
            />
          </div>
          <div>
            <label>Moves: {this.state.moves.length}</label>
            <input
              type="number"
              value={this.state.newMove}
              onChange={event => {
                this.setState({ newMove: event.target.value });
              }}
            />
            <button
              onClick={() => {
                const sizes = [];
                const i = this.state.moves.length;

                for (let j = 0; j < this.state.newMove; j++) {
                  sizes.push({
                    x: 250 + 40 * j,
                    y: 30 + 60 * i
                  });
                }

                this.setState(
                  prevState => ({
                    moves: [
                      ...prevState.moves,
                      {
                        name: prevState.moves.length + 1,
                        x: 250,
                        y: 20 + 60 * prevState.moves.length,
                        size: this.state.newMove,
                        width: 30,
                        height: 30,
                        sizes
                      }
                    ]
                    // newMove: 1
                  }),
                  this.reload
                );
              }}
            >
              Add new move
            </button>
          </div>
          {this.state.moves.map((m, i) => (
            <div key={i}>
              <label>
                Size {i + 1}: {m.size}
              </label>

              {/* <button>Select sprite</button> */}
            </div>
          ))}
        </div>
        <img
          ref="image"
          src={sprite}
          alt="sprite"
          style={{ visibility: "hidden" }}
        />
      </div>
    );
  }
}
