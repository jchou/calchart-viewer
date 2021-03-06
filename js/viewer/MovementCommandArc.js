/**
 * @fileOverview Defines the MovementCommandArc class.
 */

var JSUtils = require("./utils/JSUtils");
var MathUtils = require("./utils/MathUtils");
var MovementCommand = require("./MovementCommand");
var AnimationState = require("./AnimationState");
 
/**
 * A MovementCommandArc object represents a movement along the
 * perimeter of a circular arc.
 *
 * @param {float} startX The x coordinate of the movement's start position.
 * @param {float} startY The y coordinate of the movement's start position.
 * @param {float} centerX The x coordinate of the arc center.
 * @param {float} centerY The y coordinate of the arc center.
 * @param {float angleTorotate The amount to rotate about the center, in
 *   degrees. Positive values indicate a rotation in the clockwise
 *   direction, negative values indicate a rotation in the
 *   counterclockwise direction.
 * @param {float} facingOffset The difference between the direction
 *   in which a marcher is travelling and the direction in
 *   which a marcher is facing. This angle is measured in degrees,
 *   where positive angles indicate a clockwise offset, and
 *   negative angles indicate a counterclockwise one.
 * @param {int} beats The duration of the movement, in beats.
 * @param {int} beatsPerStep The duration of each step, in beats.
 */
var MovementCommandArc = function(startX, startY, centerX, centerY, angleToRotate, facingOffset, beats, beatsPerStep) {
    this._beatsPerStep = beatsPerStep;
    this._centerX = centerX;
    this._centerY = centerY;
    this._radius = MathUtils.calcDistance(startX, startY, this._centerX, this._centerY);
    this._startAngle = MathUtils.calcAngleAbout(startX, startY, centerX, centerY);
    if (isNaN(this._startAngle)) {
        this._startAngle = 0;
    }
    this._stepAngleDelta = MathUtils.toRadians(angleToRotate) / Math.floor(beats / this._beatsPerStep);
    this._movementIsCW = this._stepAngleDelta >= 0;
    this._orientationOffset = MathUtils.toRadians(facingOffset);
    var finalAnimState = this.getAnimationState(beats);
    MovementCommand.apply(this, [startX, startY, finalAnimState.x, finalAnimState.y, beats]);
};

JSUtils.extends(MovementCommandArc, MovementCommand);

MovementCommandArc.prototype.getAnimationState = function(beatNum) {
    var numSteps = Math.floor(beatNum / this._beatsPerStep);
    var finalAngle = this._startAngle + (this._stepAngleDelta * numSteps);
    var finalX = this._radius * MathUtils.calcRotatedXPos(finalAngle) + this._centerX;
    var finalY = this._radius * MathUtils.calcRotatedYPos(finalAngle) + this._centerY;
    var finalOrientation = MathUtils.quarterTurn(finalAngle, this._movementIsCW) + this._orientationOffset;
    return new AnimationState(finalX, finalY, MathUtils.toDegrees(finalOrientation));
};

/**
 * Returns a list of (deltaX, deltaY) pairs that lie along the arc
 *
 * @return {Array<Array<int>>} an array of (deltaX, deltaY) pairs
 */
MovementCommandArc.prototype.getMiddlePoints = function() {
    var totalAngle = this._startAngle;
    var prevX = this._startX;
    var prevY = this._startY;
    var points = [];
    for (var i = 0; i < this._numBeats / this._beatsPerStep; i++) {
        totalAngle += this._stepAngleDelta;
        var x = this._radius * MathUtils.calcRotatedXPos(totalAngle) + this._centerX;
        var y = this._radius * MathUtils.calcRotatedYPos(totalAngle) + this._centerY;
        points.push([x - prevX, y - prevY]);
        prevX = x;
        prevY = y;
    }
    return points;
};

/**
 * Returns the continuity text for this movement
 * @return {String} the continuity text in the form of "GT CW 90 deg. (16 steps)"
 */
MovementCommandArc.prototype.getContinuityText = function() {
    var steps = this._numBeats / this._beatsPerStep;
    var orientation = (this._movementIsCW) ? "CW" : "CCW";
    var angle = Math.abs(Math.floor(MathUtils.toDegrees(this._numBeats * this._stepAngleDelta)));
    return "GT " + orientation + " " + angle + " deg. (" + steps + " steps)";
};

module.exports = MovementCommandArc;