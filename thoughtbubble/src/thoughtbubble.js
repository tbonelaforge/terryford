import React from 'react';
import PointDisc from './pointdisc.js';

var thoughtImages = [
  ["/static/img/thoughtbubble/arithmetic-bubble-icon.jpg", "/arithmetic"],
  ["/static/img/thoughtbubble/patent-bubble-icon.jpg", "https://www.google.com/patents/US20120189991"],
  ["/static/img/thoughtbubble/masters-project-bubble-icon.jpg", "/static/downloads/resonant-drum.pdf"],
  ["/static/img/thoughtbubble/jinac-bubble-icon.jpg", "https://www.npmjs.com/package/jinac"],
  ["/static/img/thoughtbubble/lambda-bubble-icon.jpg", "https://github.com/tbonelaforge/lambda"],
  ["/static/img/thoughtbubble/drumming-bubble-icon.jpg", "https://www.youtube.com/watch?v=CIJ404XS_ro&list=PLvdKmKn1O1yboC7iuCPmwgzFSoixHHTMC"]
];

class ThoughtBubble extends React.Component {
  constructor(props) {
    super(props);
//    this.howManyPoints = 6;
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
    let theta = this.randomAngle(); // (0, 2pi)
    let r = this.randomRadius(this.radius) + this.pointRadius;
    let x = r * Math.cos(theta);
    let y = r * Math.sin(theta);
    return {
      x: this.x + x,
      y: this.y + y,
      imageUrl: thoughtImages[i][0],
      linkUrl: thoughtImages[i][1]
    }
  }

  randomAngle() {
    let d = Math.random() * 2 * 3.14159;

    return d;
  }

  randomRadius(radius) {
    let r = Math.random() * radius;

    return r;
  }
}

module.exports = ThoughtBubble;
