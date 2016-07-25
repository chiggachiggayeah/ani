// DONE:30 there shouldn't be more than one dot at the same location
// DONE:0 get a simple chain to follow the mouse
// DONE:20 bug where connection is drawn when you drag to a halfway point
// DONE:40 node gets drawn always at halfway point
// TODO: skeleton has to maintain whatever structure it's given (if arrow has to stay arrow)
// TODO: constraint link should have more leeway
// TODO: draw constraint better
// TODO: skeleton breaks for a bit when it moves (pieces move apart)
// TODO: move towards a shifting goal point
// TODO: need a way to edit a skeleton
// TODO: flip the normal away from the body
// TODO: accumulate forces on the nodes
// TODO: show the direction of the normal on the along the constraint edge after it's drawn
// TODO: have a simple collection minigame going on in the backgroun w/out any explanation really

function setup() {
  createCanvas(windowWidth, windowHeight);
  bot = new Bot();
  canvas = new Canvas();
  dot = new Node();
  PLAY = false;
  CONSTRAIN = false;
  INV_CONSTRAIN = false;
  CONSTRAINT_KEYS = 'abcdefghijklmnopqrstuvwxyz';
}

// set the initial point of the hintLine
// if the closest point already has a bot node
function mousePressed() {
  var remX = mouseX % 50;
  var remY = mouseY % 50;
  var nearX = remX < 20 ? mouseX - remX : Math.ceil(mouseX / 50) * 50;
  var nearY = remY < 20 ? mouseY - remY : Math.ceil(mouseY / 50) * 50;

  var nodeList = bot.nodes.filter(function(n){
    return n.x == nearX && n.y == nearY;
  });

  if(nodeList.length != 0 && canvas.hintLine.x1 == "") {
    canvas.hintLine.updateHead(nearX, nearY);
  }
}

// reset the hintLine
function mouseReleased() {
  var remX = mouseX % 50;
  var remY = mouseY % 50;
  var nearX = remX < 20 ? mouseX - remX : Math.ceil(mouseX / 50) * 50;
  var nearY = remY < 20 ? mouseY - remY : Math.ceil(mouseY / 50) * 50;

  var nodeList = bot.nodes.filter(function(n){
    return n.x == nearX && n.y == nearY;
  });

  // console.log(nearY);

  if(nodeList.length == 0) {
    bot.addNode();
  }
  // add the hintline to the bot
  if(canvas.hintLine.x1 != "" && canvas.hintLine.x2 != "") {
    var _connections = bot.connections.filter(function(c){
      if(c.x1 == canvas.hintLine.x1 && c.x2 == canvas.hintLine.x2 && (c.y1 == canvas.hintLine.y1 && c.y2 == canvas.hintLine.y2)) {
        return true;
      };
      if(c.x1 == canvas.hintLine.x2 && c.x2 == canvas.hintLine.x1 && (c.y1 == canvas.hintLine.y2 && c.y2 == canvas.hintLine.y1)) {
        return true;
      };
      return false
    });
    if(_connections.length == 0) {
      bot.addConnection();
      // infer x1, x2 for the eqns
      if(canvas.hintLine.x1 < canvas.hintLine.x2) {
        bot.addLink(canvas.hintLine.x1, canvas.hintLine.y1, canvas.hintLine.x2, canvas.hintLine.y2);
      } else {
        bot.addLink(canvas.hintLine.x2, canvas.hintLine.y2, canvas.hintLine.x1, canvas.hintLine.y1);
      }
      if(CONSTRAIN || INV_CONSTRAIN) {
        var key = CONSTRAINT_KEYS[Object.keys(bot.constraintDict).length];
        bot.constraintDict[key] = bot.links[bot.links.length - 1];
      }
    }
  }
  // stop drawing the hintline
  canvas.hintLine = new Connection();
}

// move the endpoint of the current connection
// if we're dragging out a line
function mouseDragged() {
  // console.log("mouse drag");
  canvas.hintLine.updateTail();
  // console.log(canvas.hintLine)
  // canvas.updateHintLine();
}

function drawDots() {
  fill(160, 160, 160);
  noStroke();
  for(var x = 0; x < windowWidth; x++) {
    for(var y = 0; y < windowHeight; y++) {
      if(y % 50 == 0 && x % 50 == 0) {
        ellipse(x, y, 2, 2);
      }
    }
  }
}

// NODETYPES
var NodeTypes = {
  GENERATOR: "generator",
  EFFECTOR: "effector",

};
/////////////

function Node(x = "", y = "") {
  var _this = this;
  this.shape = null;
  this.x = x;
  this.y = y;
  this.prevX;
  this.prevY;

  this.set = function(x, y) {
    this.x = x;
    this.y = y;
  }

  this.update = function() {
    this.x = mouseX;
    this.y = mouseY;
  }

  this.erase = function() {
    fill(0, 0)
  };

  this.drawRaw = function() {
    fill(0);
    ellipse(this.x, this.y, 6, 6);
  }

  this.display = function() {
    fill(0);
    ellipse(this.x, this.y, 6, 6);
  };
}

// TODO:20 refactor remX, remY, nearX etc. for more code reuse
// TODO:10 make display parallel to the node display
// not even sure that we need this anymore
function Connection(x1 = "", y1 = "", x2 = "", y2 = "") {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;

  this.set = function(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  this.updateTail = function(x2, y2) {
    var remX = mouseX % 50;
    var remY = mouseY % 50;
    var nearX = remX < 20 ? mouseX - remX : Math.ceil(mouseX / 50) * 50;
    var nearY = remY < 20 ? mouseY - remY : Math.ceil(mouseY / 50) * 50;
    var give = 20;

    this.x2 = x2 ? x2 : nearX;
    this.y2 = y2 ? y2 : nearY;
  }

  // update head should just have coordinates passed to it
  this.updateHead = function(x1, y1) {
    this.x1 = x1 ? x1 : mouseX;
    this.y1 = y1 ? y1 : mouseY;
  }

  this.drawRaw = function() {
    stroke(0);
    strokeWeight(0.4);
    line(this.x1, this.y1, this.x2, this.y2);
  }

  // the check for drag works, but this should be a more generic display function
  // this is just the display for the building phase
  this.display = function() {
    var remX = mouseX % 50;
    var remY = mouseY % 50;
    // var nearX = remX < 20 ? mouseX - remX : Math.ceil(mouseX / 50) * 50;
    // var nearY = remY < 20 ? mouseY - remY : Math.ceil(mouseY / 50) * 50;
    var give = 20;
    // to make sure that the line doesn't start
    // drawing until the components are actually set
    if(this.x1 != "" && this.x2 != "") {
      if(remX < 20 || (remX > 50 - give) && remY < 20 || (remY > 50 - give)) {
        fill(0);
        stroke(0);
        strokeWeight(0.4);
        line(this.x1, this.y1, this.x2, this.y2);
      }
    }
  }

}

// for rotating in the ccd code
// isConstraint bool
function Link(connection, node1, node2) {
  this.isConstraint = CONSTRAIN;
  this.isInvConstraint = INV_CONSTRAIN;
  this.diff = 0;
  // for rendering
  this.connection = connection;
  this.node1 = node1;
  this.node2 = node2;
  ////////////////

  // should have accessors
  this.x = this.node1.x;
  this.y = this.node1.y;

  this.angle = 0;
  this.length = sqrt((node1.x - node2.x)*(node1.x - node2.x) + (node1.y - node2.y)*(node1.y - node2.y));
  this.maxLength = this.length;
  // this.length = 100;
  this.parent = [];

  var isActive = false;

  this.setActive = function() {
    isActive = true;
  };

  this.setInactive = function() {
    isActive = false;
  };

  this.getIsActive = function() {
    return isActive;
  }

  this.updateComponents = function() {
    this.connection.set(this.x, this.y, this.x + cos(this.angle) * this.length, this.y + sin(this.angle) * this.length)
    this.node1.set(this.x, this.y);
    this.node2.set(this.x + cos(this.angle) * this.length, this.y + sin(this.angle) * this.length);
  }

  // rendering for the movement phase
  this.render = function() {
    stroke(0)
    strokeWeight(0.4);
    this.updateComponents();
    // line(this.x, this.y, this.x + cos(this.angle) * this.length, this.y + sin(this.angle) * this.length);
    // this.connection.drawRaw();
    // this.node1.drawRaw();
    // this.node2.drawRaw();
  }

  this.pointAt = function(x, y) {
    var dx = x - this.x,
        dy = y - this.y;
    this.angle = atan2(dy, dx);
  }

  // you can just keep dragging recursively
  // going to make drag work differently
  this.drag = function(x, y) {
    // point at
    this.pointAt(x, y);
    // update the initial x of the line
    // this is weird
    this.x = x - cos(this.angle) * this.length;
    this.y = y - sin(this.angle) * this.length;

    this.render(); // actually render

    // parent will be an array
    // update to point at the correct point
    if(this.parent.length > 0) {
      var _this = this;
      // this.parent.forEach(function(link){
      //   link.drag(_this.x, _this.y);
      // })
      // for(var i = 0; i < this.parent.length; i++) {
      //   this.parent[i].drag(this.parent[i].x, this.parent[i].y);
      // }
      // this.parent[0].drag(this.x, this.y);
      // this.lastLink = this.parent;
    }
  }
}

// what if I just grab the motion path and exert an opposite force on the other nodes?

// the node has to be shared
// you could probably just influence one dimension of the node
// and then let constraint solving do the rest
// maybe add to a force accumulator on the bot

// how does the motor get a key assigned to it?
// sourceNode: the node affecting the change
// endNode: the node being affecting
// direction: the direction in which the sourceNode is influencing the endNode
// shorten a constraint while the button is pressed? shorten constraint to zero?
function Motor(sourceNode, endNode, direction, controlKey) {
  this.sourceNode = sourceNode;
  this.endNode = endNode;
  this.direction = direction;
  this.keyCode = controlKey;
  this.dictKey = sourceNode.x.toString() + sourceNode.y.toString() + endNode.x.toString() + endNode.y.toString();

  this.activate = function() {

  };
};

// a jet will be
// function Jet(sourceNode, direction)

// the user might have to specify constraints
function Bot() {
  this.nodes = [];
  this.connections = [];
  this.links = [];
  this.constraintDict = {};
  this.f = {};
  this.f.x = 0;
  this.f.y = 0;
  // this.lastLink = this.links[this.links.length - 1];
  this.lastLink = this.links[0];

  this.addNode = function() {
    if(canvas.hint.x != undefined && canvas.hint.y != undefined) {
      this.nodes.push(new Node(canvas.hint.x, canvas.hint.y))
      // console.log("Node x: %s, y: %s", canvas.hint.x, canvas.hint.y);
      // console.log("Node length: %s", this.nodes.length);
    }
  };

  this.addConnection = function() {
    if(canvas.hint.x != undefined && canvas.hint.y != undefined) {
      this.connections.push(new Connection(
        canvas.hintLine.x1,
        canvas.hintLine.y1,
        canvas.hintLine.x2,
        canvas.hintLine.y2))

      // console.log("Connections length: %s", this.connections.length);
      // console.log("Connection x1: %s, y1: %s, x2: %s, y2: %s", canvas.hintLine.x1, canvas.hintLine.y1, canvas.hintLine.x2, canvas.hintLine.y2);
    }
  };

  this.addLink = function(x1, y1, x2, y2) {
    // last connection and the last two nodes
    if(canvas.hint.x != undefined && canvas.hint.y != undefined) {
      var nodeLen = this.nodes.length,
          conLen = this.connections.length;
      // the nodes might not be correct, bc you can draw to / from an arbitrarily old node
      var n1 = this.nodes.filter(function(n){
        return n.x == x1 && n.y == y1;
      })[0];
      var n2 = this.nodes.filter(function(n){
        return n.x == x2 && n.y == y2;
      })[0];

      // var newLink = new Link(this.connections[conLen - 1], this.nodes[nodeLen - 2], this.nodes[nodeLen - 1]);
      var newLink = new Link(this.connections[conLen - 1], n1, n2);
      this.links.push(newLink);

      // set the parent (when parent was just an element)
      // if(this.links.length > 1) {
      //   this.links[this.links.length - 1].parent = this.links[this.links.length - 2];
      // }

      // new set parent (children might be more appropriate)
      // search for an appropriate child (parent, since you're going up the chain)
      // an appropriate parent is just a link with whom you share a node
      // console.log(this.links.length);
      var children = this.links.filter(function(l, ind, a) {
        if(ind != a.indexOf(newLink)) {
          return [newLink.node1, newLink.node2].indexOf(l.node1) != -1 || [newLink.node1, newLink.node2].indexOf(l.node2) != -1;
        }
      });
      // add yourself to that child's parent array
      if(children.length > 0) {
        // console.log("found parent!");
        // console.log(this.links.indexOf(children[0]));
        children[0].parent.push(newLink);
        // this.links[this.links.indexOf(children[0])].parent.push(newLink);
        // console.log(this.links[this.links.indexOf(children[0])].parent[0].y);
        // console.log(parents[0].parent);
      }
      /////////////////

      // update last link
      // this.lastLink = this.links[this.links.length - 1];
      // this.lastLink = newLink;
      if(this.links.length == 1) this.lastLink = newLink;
    }

  };

  // TODO:0 connections loop should call display
  // TODO: update connections in simulation
  // could probably just loop over the links
  this.display = function() {
    for(var i = 0; i < this.nodes.length; i++) {
      this.nodes[i].display();
    }
    for(var i = 0; i < this.links.length; i++) {
      var c = this.links[i];
      stroke(0);
      strokeWeight(0.4);
      if(this.links[i].isConstraint || this.links[i].isInvConstraint) {
        for (var j = 0; j <= 10; j++) {
          var x = lerp(c.node1.x, c.node2.x, j/10.0);
          var y = lerp(c.node1.y, c.node2.y, j/10.0);
          point(x, y);
        }
      } else {
        line(c.node1.x, c.node1.y, c.node2.x, c.node2.y);
      }
    }
  }
}

function Canvas() {
  var _this = this;
  this.hint = "";
  this.hintLine = new Connection();

  this.updateHint = function() {
    var give = 20
    var remX = mouseX % 50;
    var remY = mouseY % 50;
    // console.log(remX);
    if(remX < 20 || (remX > 50 - give) && remY < 20 || (remY > 50 - give)) {
      // console.log("near")
      this.hint = new Node();
      // _this.hint = new Node(mouseX - remX, mouseY - remY);
      this.hint.x = remX < 20 ? mouseX - remX : Math.ceil(mouseX / 50) * 50;
      this.hint.y = remY < 20 ? mouseY - remY : Math.ceil(mouseY / 50) * 50;
      this.hint.display();
    } else {
      this.hint = "";
    }
  };

  // DONE:10 click and drag or interpolate?
  this.updateHintLine = function() {
    // would like to call hintLine display here
    this.hintLine.display();
  };

  // the update function for the canvas
  this.update = function() {
    this.updateHint();
    this.updateHintLine();
  }
}

var dot;

function keyPressed() {
  // space
  if(keyCode === 32) {
    // ComputeCCD(bot, createVector(mouseX, mouseY));
    PLAY = !PLAY;

  };
  // 1
  if(keyCode === 49) {
    CONSTRAIN = !CONSTRAIN
    INV_CONSTRAIN = false;
  };

  //
  if(keyCode === 50) {
    INV_CONSTRAIN = !INV_CONSTRAIN;
    CONSTRAIN = false;
  }
}

// could I just move the the initial node towards the point and then just satisfy constraints?
// I think I'll try

// TODO: this code is awful in terms of time complexity
// need to keep the machine from going off the screen
function simulate(robot) {
    var particles = robot.nodes;
    var links = robot.links; // analagous to constraints
    var STEPS = 3;
    // particles[0].set(mouseX, mouseY);
    for(var s = 0; s < STEPS; s++) {
      for(var i = 0; i < links.length; i++) {
        var n1 = links[i].node1;
        var n2 = links[i].node2;

        var deltalength = sqrt((n2.x - n1.x)*(n2.x - n1.x) + (n2.y - n1.y)*(n2.y - n1.y));
        var diff;
        if(links[i].isConstraint || links[i].isInvConstraint) {
          // console.log(links[i].diff);
          var curLength = min(links[i].maxLength, max(links[i].length - links[i].diff, 10));
          // was checking if the length was less than the prev length (link.length)
          if(curLength < links[i].length) {
            // get the difference in position for the end nodes
            // exert a mirrored force of the other nodes (in x and y probably)
            // (maybe even just one other node, and let the constraint solving figure out the rest)
            if(!links[i].getIsActive()) {
              robot.f.x = n2.x - n1.x;
              robot.f.y = n2.y - n1.y;
              console.log(robot.f.y);
              // add the force to any node connected to either of these nodes?
              // robot.links.forEach(function(link) {
              //   // console.log(link);
              //   if([link.node1, link.node2].indexOf(n1) != -1 || [link.node1, link.node2].indexOf(n2) != -1) {
              //     console.log("force added y: %s", -robot.f.x);
              //     console.log("force added x: %s", -robot.f.y);
              //     var li = [link.node1, link.node2].indexOf(n1) == -1 ? [link.node1, link.node2].indexOf(n2) : [link.node1, link.node2].indexOf(n1)
              //     var l = li === 0 ? [link.node1, link.node2][li + 1] : [link.node1, link.node2][li];
              //     l.x += (-robot.f.y * frameRate() / 100) * 0.001;
              //     l.y += (-robot.f.x * frameRate() / 100) * 0.001;
              //   }
              // });
              if(links[i].isConstraint) {
                n2.x += (robot.f.y * frameRate() / 100) * 0.5;
                n2.y += (-robot.f.x * frameRate() / 100) * 0.5;
                n1.x += (robot.f.y * frameRate() / 100) * 0.5;
                n1.y += (-robot.f.x * frameRate() / 100) * 0.5;
              } else {
                n2.x += (-robot.f.y * frameRate() / 100) * 0.5;
                n2.y += (robot.f.x * frameRate() / 100) * 0.5;
                n1.x += (-robot.f.y * frameRate() / 100) * 0.5;
                n1.y += (robot.f.x * frameRate() / 100) * 0.5;
              }

              links[i].setActive();
            }
          } else {
            if(links[i].getIsActive()) links[i].setInactive();
          }
          links[i].length = min(links[i].maxLength, max(links[i].length - links[i].diff, 10));
          diff = (links[i].length - deltalength) / deltalength;
        } else {
          if(links[i].getIsActive()) links[i].setInactive();
          diff = (links[i].length - deltalength) / deltalength;
        }
        var deltaX = n2.x - n1.x;
        var deltaY = n2.y - n1.y;

        // accumulate the forces
        // should a force just stay on each point and get added in the simulation loops
        // n2.x += -robot.f.y * .001;
        // n2.y += -robot.f.x * .001;
        // n1.x += -robot.f.y * .001;
        // n1.y += -robot.f.x * .001;

        n1.prevX = n1.x;
        n1.prevY = n1.y;
        n2.prevX = n2.x;
        n2.prevY = n2.y;

        n1.x -= deltaX * 0.6 * diff;
        n1.y -= deltaY * 0.6 * diff;
        n2.x += deltaX * 0.6 * diff;
        n2.y += deltaY * 0.6 * diff;

        // screen constraint
        n1.x = min(max(0, n1.x), windowWidth);
        n1.y = min(max(0, n1.y), windowHeight);
        n2.x = min(max(0, n2.x), windowWidth);
        n2.y = min(max(0, n2.y), windowHeight);
      }
    }

}

function draw() {
  background(255, 255, 255);
  drawDots();
  // console.log(mouseX);
  // stroke(0);
  // strokeWeight(50);
  // line(100, 100, 1000, 1000);
  canvas.update();
  bot.display();
  // simulate(bot);

  if(PLAY) {
    textSize(32);
    text("PLAY", 100, 100);
    simulate(bot);
  };
  if(CONSTRAIN) {
    textSize(20)
    text("CONSTRAINT", 100, 150);
  };
  if(INV_CONSTRAIN) {
    textSize(20)
    text("INV_CONSTRAINT", 100, 150);
  };

  // grabbing key presses
  for(var i = 65; i < 92; i++) {
      var key = CONSTRAINT_KEYS[i - 65];
      var link = bot.constraintDict[key];

      // this initial part is pretty irrelevant
      if(keyIsDown(i) && keyIsDown(SHIFT) && link) {
        link.diff = (frameRate() / 50) * -1;
      } else if(keyIsDown(i) && link) {
        link.diff = (frameRate() / 30);
      } else if(link){
        link.diff = (frameRate() / 30) * -1;
      };


  }


}
