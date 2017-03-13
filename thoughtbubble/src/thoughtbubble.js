import React from 'react';
import PointDisc from './pointdisc.js';

var pi = 3.14159;

var thoughtImages = [
  ["/static/img/thoughtbubble/arithmetic-bubble-icon.jpg", "/arithmetic", pi / 3],
  ["/static/img/thoughtbubble/patent-bubble-icon.jpg", "https://www.google.com/patents/US20120189991", 5 * pi / 3],
  ["/static/img/thoughtbubble/masters-project-bubble-icon.jpg", "/static/downloads/resonant-drum.pdf", 2 * pi / 3],
  ["/static/img/thoughtbubble/jinac-bubble-icon.jpg", "https://www.npmjs.com/package/jinac", 4 * pi / 3],
  ["/static/img/thoughtbubble/lambda-bubble-icon.jpg", "https://github.com/tbonelaforge/lambda", pi],
  ["/static/img/thoughtbubble/drumming-bubble-icon.jpg", "https://www.youtube.com/watch?v=CIJ404XS_ro&list=PLvdKmKn1O1yboC7iuCPmwgzFSoixHHTMC", 0],
  ["/static/img/thoughtbubble/thought-bubble-icon.jpg", "https://github.com/tbonelaforge/terryford"]
];

class ThoughtBubble extends React.Component {
  constructor(props) {
    super(props);
    this.howManyPoints = thoughtImages.length;
    this.x = parseInt(props.x);
    this.y = parseInt(props.y);
    this.svgWidth = parseInt(props.svgWidth);
    this.svgHeight = parseInt(props.svgHeight);
    this.radius = parseInt(props.radius);
    this.pointRadius = parseInt(props.pointRadius);
  }

  createRandomPointData() {
    let pointData = [];
    for (let i = 0; i < this.howManyPoints; i++) {
      pointData.push(this.randomPointDatum(i));
    }
    return pointData;
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    let pointData = this.createRandomPointData();
    return (
      <PointDisc
      center={{x: this.x, y: this.y}}
      radius={this.radius}
      pointRadius={this.pointRadius}
      svgWidth={this.svgWidth}
      svgHeight={this.svgHeight}
      pointData={pointData} />
    );
  }

  randomPointDatum(i) {
    let angle = thoughtImages[i][2];
    if (angle != null) {
      let theta = this.randomAngle(angle);
      let r = this.randomRadius(this.radius) + this.pointRadius;
      let x = r * Math.cos(theta);
      let y = -r * Math.sin(theta);
      return {
        x: this.x + x,
        y: this.y + y,
        imageUrl: thoughtImages[i][0],
        linkUrl: thoughtImages[i][1]
      }
    } else {
      let x = (Math.random() - 0.5) * 1.5 * this.pointRadius;
      let y = (Math.random() - 0.5) * 1.5 * this.pointRadius;
      return {
        x: this.x + x,
        y: this.y + y,
        imageUrl: thoughtImages[i][0],
        linkUrl: thoughtImages[i][1]
      }
    }
  }

  randomAngle(angle) {
    let t = angle + (Math.random() - 0.5) * pi / 6;

    return t;
  }

  randomRadius(radius) {
    let r = Math.random() * radius;

    return r;
  }
}

module.exports = ThoughtBubble;
