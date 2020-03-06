import React, { Component } from "react";

import sprite from "./sprite.png";

export default class App extends Component {
  state = {
    width: 200,
    height: 192,
    moves: [],
    newName: "",
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
      window.requestAnimationFrame(() => this.animate());
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

    let startLine = 0;
    let endLine = 0;
    let newLine = false;

    const rows = [];
    const columns = [];

    this.setState({
      rectangles: []
    });

    for (let y = 0; y < height; y++) {
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

        columns.push([middle, 0, middle, height]);
      }
    }

    const rectangles = [];

    for (let i = 0; i < rows.length - 1; i++) {
      const row = rows[i];
      const nextRow = rows[i + 1];

      for (let j = 0; j < columns.length - 1; j++) {
        const col = columns[j];
        const nextCol = columns[j + 1];

        const X = col[0];
        const Y = row[1];
        const w = nextCol[0] - X;
        const h = nextRow[1] - Y;

        const imageData = this.state.context.getImageData(X, Y, w, h);
        const buffer = new Uint32Array(imageData.data.buffer);
        let x;
        let y;
        let x1 = w;
        let y1 = h;
        let x2 = 0;
        let y2 = 0;

        for (y = 0; y < h; y++) {
          for (x = 0; x < w; x++) {
            if (buffer[x + y * w] > 0) {
              if (x < x1) x1 = x;
            }
          }
        }

        for (y = 0; y < h; y++) {
          for (x = w; x >= 0; x--) {
            if (buffer[x + y * w] > 0) {
              if (x > x2) x2 = x;
            }
          }
        }

        for (x = 0; x < w; x++) {
          for (y = 0; y < h; y++) {
            if (buffer[x + y * w] > 0) {
              if (y < y1) y1 = y;
            }
          }
        }

        for (x = 0; x < w; x++) {
          for (y = h; y >= 0; y--) {
            if (buffer[x + y * w] > 0) {
              if (y > y2) y2 = y;
            }
          }
        }

        context.strokeStyle = "green";
        context.beginPath();
        context.rect(X + x1, Y + y1, x2 - x1, y2 - y1);
        context.stroke();

        rectangles.push([X + x1, Y + y1, x2 - x1, y2 - y1]);
      }
    }

    this.setState({
      rectangles
    });
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

    for (let i = 0; i < this.state.moves.length; i++) {
      const move = this.state.moves[i];
      const position = this.calculateMove(i);

      context.fillText(move.name, position.x, position.y);

      for (let j = 0; j < move.sizes.length; j++) {
        const sizePosition = this.calculateSprite(i, j);

        if (move.sizes[j].rectangle > -1) {
          const imageData = this.state.context.getImageData(
            this.state.rectangles[move.sizes[j].rectangle][0],
            this.state.rectangles[move.sizes[j].rectangle][1],
            this.state.rectangles[move.sizes[j].rectangle][2],
            this.state.rectangles[move.sizes[j].rectangle][3]
          );

          const offsetX = (move.width - imageData.width) / 2;
          const offsetY = (move.height - imageData.height) / 2;

          this.state.context.putImageData(
            imageData,
            sizePosition.x + offsetX,
            sizePosition.y + offsetY
          );
        }

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
        context.rect(sizePosition.x, sizePosition.y, move.width, move.height);
        context.stroke();
      }

      const previewPosition = this.calculateSprite(i, move.sizes.length);
      context.strokeStyle = "green";
      context.beginPath();
      context.rect(
        previewPosition.x - 1,
        previewPosition.y - 1,
        move.width + 2,
        move.height + 2
      );
      context.stroke();
    }
  }

  animate() {
    if (!this.start) {
      this.start = 0;
    }

    if (!this.time) {
      this.time = 0;
    }

    for (let i = 0; i < this.state.moves.length; i++) {
      const move = this.state.moves[i];

      let all = true;
      for (let j = 0; j < move.sizes.length; j++) {
        if (move.sizes[j].rectangle === -1) {
          all = false;
          break;
        }
      }

      if (all) {
        const previewPosition = this.calculateSprite(i, move.sizes.length);
        this.state.context.clearRect(
          previewPosition.x,
          previewPosition.y,
          move.width,
          move.height
        );

        const index = this.start % move.sizes.length;
        const imageData = this.state.context.getImageData(
          this.state.rectangles[move.sizes[index].rectangle][0],
          this.state.rectangles[move.sizes[index].rectangle][1],
          this.state.rectangles[move.sizes[index].rectangle][2],
          this.state.rectangles[move.sizes[index].rectangle][3]
        );

        this.state.context.putImageData(
          imageData,
          previewPosition.x,
          previewPosition.y
        );

        // console.log("animate", this.time);
      }
    }

    this.time++;

    if (this.time > 10) {
      this.start++;
      this.time = 0;
    }

    // if (this.start === move.sizes.length) {
    //   this.start = 0;
    // }

    window.requestAnimationFrame(() => this.animate());
  }

  calculateMove(i) {
    let y = 20;

    const moves = this.state.moves;
    for (let k = 0; k < i; k++) {
      const move = moves[k];
      y += (move.height + 10) * 2;
    }

    return {
      x: 250,
      y
    };
  }

  calculateSprite(i, j) {
    const position = this.calculateMove(i);
    const move = this.state.moves[i];

    let x = position.x + (move.width + 10) * j;
    let y = position.y + 10;

    return {
      x,
      y
    };
  }

  render() {
    return (
      <div style={{ display: "flex" }}>
        <canvas
          ref="canvas"
          width={600}
          height={window.outerHeight}
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
                const size = this.calculateSprite(i, j); //move.sizes[j];

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

            for (let i = 0; i < this.state.moves.length; i++) {
              const move = this.state.moves[i];
              for (let j = 0; j < move.sizes.length; j++) {
                const size = this.calculateSprite(i, j); // move.sizes[j];

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

            if (
              this.state.selectMoveRectangleI === -1 ||
              this.state.selectMoveRectangleJ === -1
            ) {
              return;
            }

            for (let i = 0; i < this.state.rectangles.length; i++) {
              const rectangle = this.state.rectangles[i];
              if (
                x >= rectangle[0] &&
                x <= rectangle[0] + rectangle[2] &&
                y >= rectangle[1] &&
                y <= rectangle[1] + rectangle[3]
              ) {
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

                const nextI =
                  this.state.selectMoveRectangleJ ===
                  moves[this.state.selectMoveRectangleI].sizes.length - 1
                    ? this.state.selectMoveRectangleI === moves.length - 1
                      ? this.state.selectMoveRectangleI
                      : this.state.selectMoveRectangleI + 1
                    : this.state.selectMoveRectangleI;

                const nextJ =
                  this.state.selectMoveRectangleJ <
                  moves[this.state.selectMoveRectangleI].sizes.length - 1
                    ? this.state.selectMoveRectangleJ + 1
                    : 0;

                this.setState({
                  moves,
                  selectMoveRectangleI: nextI,
                  selectMoveRectangleJ: nextJ
                });
                break;
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
          <br />
          <div>
            <div>
              <label>Moves:</label>
              <input
                type="number"
                value={this.state.newMove}
                onChange={event => {
                  this.setState({ newMove: event.target.value });
                }}
              />
            </div>
            <div>
              <label>Name:</label>
              <input
                type="text"
                value={this.state.newName}
                onChange={event => {
                  this.setState({ newName: event.target.value });
                }}
              />
            </div>
            <button
              onClick={() => {
                const sizes = [];
                const i = this.state.moves.length;

                for (let j = 0; j < this.state.newMove; j++) {
                  sizes.push({
                    x: 250 + 40 * j,
                    y: 30 + 60 * i,
                    rectangle: -1
                  });
                }

                this.setState(
                  prevState => ({
                    newName: "",
                    selectMoveRectangleI: prevState.moves.length,
                    selectMoveRectangleJ: 0,
                    moves: [
                      ...prevState.moves,
                      {
                        name: this.state.newName,
                        x: 250,
                        y: 20 + 60 * prevState.moves.length,
                        size: this.state.newMove,
                        width: 20,
                        height: 20,
                        sizes
                      }
                    ]
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
              <label>{m.name}:</label>
              <br />

              <button
                onClick={() => {
                  const moves = Array.from(this.state.moves);

                  moves[i].width = 20;
                  moves[i].height = 20;
                  moves[i].sizes = moves[i].sizes.map(s => ({
                    ...s,
                    rectangle: -1
                  }));

                  this.setState({
                    moves
                  });
                }}
              >
                Reset
              </button>
              <button
                onClick={() => {
                  this.setState({
                    moves: this.state.moves.filter((_, index) => index !== i)
                  });
                }}
              >
                Delete
              </button>
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
