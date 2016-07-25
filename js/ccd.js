// TODO:30 refactor to use p5.js functions

var TRIES = 100;
var THRESHOLD = 1;

function Dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
}

// well now this has a z?
function Cross(v1, v2) {
  var newVector = {};
  newVector.z = v1.x * v2.y - v2.x * v2.y;
  return newVector;
}

function VectorSqrdDistance(x1, y1, x2, y2) {
  return sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)))
}

function Magnitude(vector) {
  return sqrt((vector.x * vector.x) + (vector.y * vector.y))
}

// just for 2D vectors
function Normalize(vector) {
  var _vector = {};
  var mag = Magnitude(vector);
  _vector.x = vector.x / mag;
  _vector.y = vector.y / mag;
  return _vector;
}

// end target is a position object (x, y)
// for now just assume the first element is the effector (part leading the chain)
function ComputeCCD(robot, endPos) {
  var rootPos, curEnd, desiredEnd, targetVector, curVector, crossResult;
  var cosAngle, turnAngle, turnDeg;
  var link, tries;

  link = robot.connections.length - 1;
  tries = 0;

  rootPos = createVector(robot.connections[link].x2, robot.connections[link].y2);
  curEnd = createVector(robot.connections[link].x1, robot.connections[link].y1);
  desiredEnd = createVector(endPos.x, endPos.y);


  // only in two dimensions
  // connections might need a reference to it's roots

  // take x2, y2 to be the position of the root
  // actually have to move the points
  while(tries < TRIES && VectorSqrdDistance(curEnd.x, curEnd.y, desiredEnd.x, desiredEnd.y)) {
    console.log("computing");
    // THE ROOT OF THE CURRENT LINK
    // rootPos = {};
    // rootPos.x = robot.connections[link].x2;
    // rootPos.y = robot.connections[link].y2;
    rootPos = createVector(robot.connections[link].x2, robot.connections[link].y2);

    // POSITION OF END EFFECTOR
    // curEnd = {};
    // curEnd.x = robot.connections[link].x1;
    // curEnd.y = robot.connections[link].y1;
    curEnd = createVector(robot.connections[link].x1, robot.connections[link].y1);

    // DESIRED END
    // desiredEnd = {};
    // desiredEnd.x = endPos.x;
    // desiredEnd.y = endPos.y;
    desiredEnd = createVector(endPos.x, endPos.y);

    // only do something if we haven't 'arrived'
    if(VectorSqrdDistance(curEnd.x, curEnd.y, desiredEnd.x, desiredEnd.y)) {
      // curVector = {};
      // curVector.x = curEnd.x - rootPos.x;
      // curVector.y = curEnd.y - rootPos.y;
      curVector = createVector(curEnd.x - rootPos.x, curEnd.y - rootPos.y);

      // create the desired effector position vectro
      // targetVector = {};
      // targetVector.x = endPos.x - rootPos.x;
      // targetVector.y = endPos.y - rootPos.y;
      targetVector = createVector(endPos.x - rootPos.x, endPos.y - rootPos.y);

      // normalize
      // curVector = Normalize(curVector);
      // targetVector = Normalize(targetVector);
      curVector.normalize();
      targetVector.normalize();

      // for the cosine
      // cosAngle = Dot(targetVector, curVector);
      cosAngle = targetVector.dot(curVector);

      // if it's one then the angle is 0 degrees and no rotation is necessary
      // rotate the currentVector and then update the lines coordinates?
      if(cosAngle < 0.99999) {
        // crossResult = Cross(targetVector, curVector);
        crossResult = targetVector.cross(curVector);
        // rotate clockwise
        if(crossResult.z > 0) {
          turnAngle = acos(cosAngle);
          turnDeg = degrees(turnAngle);
          rotate(-turnDeg);
        } else if(crossResult.z < 0) {
          // rotate counterclockwise
          turnAngle = acos(cosAngle)
          turnDeg = degrees(turnAngle);
          rotate(turnDeg)
        }
      }
      if(--link < 0) link = robot.connections.length - 1;
    }
  }
}
