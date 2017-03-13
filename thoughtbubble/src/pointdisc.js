import React from 'react';

class PointDisc extends React.Component {
  constructor(props) {
    super(props);
    this.centerPoint = props.center;
    this.radius = props.radius;
    this.state = {
      pointData: props.pointData
    };
    this.svgWidth = props.svgWidth;
    this.svgHeight = props.svgHeight;
    this.pointRadius = props.pointRadius;
    this.deltas = new Array(this.state.pointData.length);
    this.newPointData = new Array(this.state.pointData.length);
    this.neighborForceFactor = 1 / Math.pow(this.state.pointData.length, 1 / 10);
    this.wallForceFactor = 1 / Math.pow(this.state.pointData.length, 1 / 5);
    this.updateInterval = null;
  }

  componentDidMount() {
    var self = this;
    var numTicks = 0;

    self.updateInterval = setInterval(function() {
      var howManyChanged = self.tick();
      numTicks++
      if (howManyChanged == 0) {
        clearInterval(self.updateInterval);
      } else {
        self.setState({
          pointData: self.newPointData
        });
      }
    }, 75);
  }

  // Return the number of points that moved.
  tick() {
    let count = 0;
    let i;

    this.newPointData = new Array(this.state.pointData.length);
    for (i = 0; i < this.state.pointData.length; i++) {
      this.setDelta(i);
    }
    for (i = 0; i < this.state.pointData.length; i++) {
      if (this.tryToMovePoint(i)) {
        count += 1;
      }
    }
    return count;
  }

  setDelta(i) {
    var changed = false;
    var direction;
    var distance;
    var force;
    var component;

    this.deltas[i] = { x: 0, y: 0 };
    changed = changed || this.addNeighborComponents(i);
    changed = changed || this.addWallComponent(i);
    return changed;
  }

  addNeighborComponents(i) {
    var changed = false;
    var direction;
    var distance;
    var velocity;
    var component;

    for (let j = 0; j < this.state.pointData.length; j++) {
      if (j == i) {
        continue;
      }
      direction = subtract(this.state.pointData[i], this.state.pointData[j]);
      if (direction.x == 0 && direction.y == 0) {
        direction = { x: Math.random(), y: Math.random() };
      }
      distance = magnitude(direction)
      if (distance < neighborC) {
        changed = true;
        velocity = Math.pow((neighborC - distance), 1/2) * this.neighborForceFactor;
        component = normalize(direction);
        component = scale(component, velocity);
        this.deltas[i] = add(this.deltas[i], component);
      }
    }
    return changed;
  }

  addWallComponent(i) {
    var v = subtract(this.state.pointData[i], this.centerPoint);
    var vr = magnitude(v);
    var component = normalize(scale(v, -1));
    if (vr > (this.radius - wallC)) {
      let velocity = wallC / 5;
      let component = normalize(scale(v, -1));
      component = scale(component, velocity);
      component.x += (Math.random() - 0.5) * 5;
      component.y += (Math.random() - 0.5) * 5;
      this.deltas[i] = add(this.deltas[i], component);
      return true;
    }
    return false;
  }

  tryToMovePoint(i) {
    var newPointDatum = add(this.state.pointData[i], this.deltas[i]);
    newPointDatum.imageUrl = this.state.pointData[i].imageUrl;
    newPointDatum.linkUrl = this.state.pointData[i].linkUrl;
    this.newPointData[i] = newPointDatum;
    if (equalWithTolerance(newPointDatum, this.state.pointData[i])) {
      return false; // Unchanged.
    }
    return true;
  }

  render() {
    var self = this;

    return (
        <svg id="point-disc" width={this.svgWidth} height={this.svgHeight}>
        <defs>
        {self.state.pointData.map(function(p, i) {
          var id = i + 1;
          var top = p.y - self.pointRadius;
          var left = p.x - self.pointRadius;
          return (
              <pattern id={'image' + id} patternUnits="userSpaceOnUse" height={100 + top} width={100 + left} key={'image' + id}>
              <image x={left} y={top} height="100" width="100" xlinkHref={p.imageUrl}></image>
              </pattern>
          );
        })}
        </defs>
        {self.state.pointData.map(function(p, i) {
          var id = i + 1;
          var imageFill = "url(#image" + id + ")";
          return (
            <circle cx={p.x} cy={p.y} r={self.pointRadius} id={id} fill={imageFill} key={id} onClick={function(event) { self.handleCircleClick(i, event); }} style={{cursor: 'pointer'}}></circle>
          );
        })}
      </svg>
    );
  }

  handleCircleClick(i, event) {
    console.log("Inside PointDisc.handleCircle click, got called with i = %d and event :\n", i, event);
    console.log("About to set window.location to:\n");
    var newLocation = this.state.pointData[i].linkUrl;
    console.log(newLocation);
    window.location = newLocation;
  }
}

var neighborC = 110;
var wallC = 70;

function magnitude(p) {
  return Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
};

function scale(p, scalar) {
  return {
    x: p.x * scalar,
    y: p.y * scalar
  };
}

function normalize(p) {
  return scale(p, 1 / magnitude(p));
};

function add(p1, p2) {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y
  };
};

function subtract(p1, p2) {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y
  };
};

var tolerance = 0.001;

function equalWithTolerance(p1, p2) {
  if (Math.abs(p1.x - p2.x) > tolerance) {
    return false;
  }
  if (Math.abs(p1.y - p2.y) > tolerance) {
    return false;
  }
  return true;
};

module.exports = PointDisc;
