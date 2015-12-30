﻿@component("flow-thumb")
class FlowThumb extends polymer.Base {

    graph: any;

    @property({ type: Number, value: 200 })
    width: number;

    @property({ type: Number, value: 150 })
    height: number;

    @property({ type: Number, value: 1 })
    thumbscale: number;

    @property({ type: Number, value: 60 })
    nodeSize: number;

    @property({ type: String, value: "hsl(184, 8%, 10%)" })
    fillStyle: string;

    @property({ type: String, value: "hsl(180, 11%, 70%)" })
    strokeStyle: string;

    @property({ type: Number, value: 0.75 })
    lineWidth: number;

    @property({ type: String, value: "dark" })
    theme: string;

    edgeColors: any;
    thumbrectangle: any;
    viewrectangle: any;
    listener:any;



    created() {
        this.edgeColors = [
            "white",
            "hsl(  0, 100%, 46%)",
            "hsl( 35, 100%, 46%)",
            "hsl( 60, 100%, 46%)",
            "hsl(135, 100%, 46%)",
            "hsl(160, 100%, 46%)",
            "hsl(185, 100%, 46%)",
            "hsl(210, 100%, 46%)",
            "hsl(285, 100%, 46%)",
            "hsl(310, 100%, 46%)",
            "hsl(335, 100%, 46%)"
        ];
    }

    ready() {
        this.thumbrectangle = [0, 0, 500, 500];
        this.viewrectangle = [0, 0, 200, 150];
    }

    attached () {
        this.style.width = this.width + "px";
        this.style.height = this.height + "px";
        this.themeChanged();
    }


    themeChanged() {
        if (this.theme === "dark") {
            this.fillStyle = "hsl(184, 8%, 10%)";
            this.strokeStyle = "hsl(180, 11%, 70%)";
            this.edgeColors = [
                "white",
                "hsl(  0, 100%, 46%)",
                "hsl( 35, 100%, 46%)",
                "hsl( 60, 100%, 46%)",
                "hsl(135, 100%, 46%)",
                "hsl(160, 100%, 46%)",
                "hsl(185, 100%, 46%)",
                "hsl(210, 100%, 46%)",
                "hsl(285, 100%, 46%)",
                "hsl(310, 100%, 46%)",
                "hsl(335, 100%, 46%)"
            ];

        } else {
            // Light
            this.fillStyle = "hsl(184, 8%, 75%)";
            this.strokeStyle = "hsl(180, 11%, 20%)";
            // Tweaked to make thin lines more visible
            this.edgeColors = [
                "hsl(  0,   0%, 50%)",
                "hsl(  0, 100%, 40%)",
                "hsl( 29, 100%, 40%)",
                "hsl( 47, 100%, 40%)",
                "hsl(138, 100%, 40%)",
                "hsl(160,  73%, 50%)",
                "hsl(181, 100%, 40%)",
                "hsl(216, 100%, 40%)",
                "hsl(260, 100%, 40%)",
                "hsl(348, 100%, 50%)",
                "hsl(328, 100%, 40%)"
            ];
        }
        // Redraw
        this.redrawGraph();
    }

    drawEdge(context, scale, source, target, route) {
        // Draw path
        try {
            context.strokeStyle = this.edgeColors[0];
            if (route) {
                // Color if route defined
                context.strokeStyle = this.edgeColors[route];
            }
            var fromX = Math.round(source.metadata.x * scale) - 0.5;
            var fromY = Math.round(source.metadata.y * scale) - 0.5;
            var toX = Math.round(target.metadata.x * scale) - 0.5;
            var toY = Math.round(target.metadata.y * scale) - 0.5;
            context.beginPath();
            context.moveTo(fromX, fromY);
            context.lineTo(toX, toY);
            context.stroke();
        } catch (error) {
        }
    }

    redrawGraph() {
        if (!this.graph) {
            return;
        }
        var context = this.$.canvas.getContext("2d");
        if (!context) {
            // ???
            setTimeout(this.redrawGraph.bind(this), 500);
            return;
        }
        // Need the actual context, not polymer-wrapped one
        //context = unwrap(context);

        // Reset origin
        context.setTransform(1, 0, 0, 1, 0, 0);
        // Clear
        context.clearRect(0, 0, this.width, this.height);
        context.lineWidth = this.lineWidth;
        // Find dimensions
        var toDraw = [];
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        var nodes = {};

        // Process nodes
        this.graph.nodes.forEach( ((process)  =>{
            if (process.metadata && !isNaN(process.metadata.x) && !isNaN(process.metadata.y)) {
                toDraw.push(process);
                nodes[process.id] = process;
                minX = Math.min(minX, process.metadata.x);
                minY = Math.min(minY, process.metadata.y);
                maxX = Math.max(maxX, process.metadata.x);
                maxY = Math.max(maxY, process.metadata.y);
            }
        }).bind(this));

        // Process exported ports
        if (this.graph.inports) {
            Object.keys(this.graph.inports).forEach( ((key) => {
                var exp = this.graph.inports[key];
                if (exp.metadata && !isNaN(exp.metadata.x) && !isNaN(exp.metadata.y)) {
                    toDraw.push(exp);
                    minX = Math.min(minX, exp.metadata.x);
                    minY = Math.min(minY, exp.metadata.y);
                    maxX = Math.max(maxX, exp.metadata.x);
                    maxY = Math.max(maxY, exp.metadata.y);
                }
            }).bind(this));
        }
        if (this.graph.outports) {
            Object.keys(this.graph.outports).forEach( ((key)  => {
                var exp = this.graph.outports[key];
                if (exp.metadata && !isNaN(exp.metadata.x) && !isNaN(exp.metadata.y)) {
                    toDraw.push(exp);
                    minX = Math.min(minX, exp.metadata.x);
                    minY = Math.min(minY, exp.metadata.y);
                    maxX = Math.max(maxX, exp.metadata.x);
                    maxY = Math.max(maxY, exp.metadata.y);
                }
            }).bind(this));
        }

        // Sanity check graph size
        if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
            return;
        }

        minX -= this.nodeSize;
        minY -= this.nodeSize;
        maxX += this.nodeSize * 2;
        maxY += this.nodeSize * 2;
        var w = maxX - minX;
        var h = maxY - minY;
        // For the-graph-nav to bind
        this.thumbrectangle[0] = minX;
        this.thumbrectangle[1] = minY;
        this.thumbrectangle[2] = w;
        this.thumbrectangle[3] = h;
        // Scale dimensions
        var scale = (w > h) ? this.width / w : this.height / h;
        this.thumbscale = scale;
        var size = Math.round(this.nodeSize * scale);
        var sizeHalf = size / 2;
        // Translate origin to match
        context.setTransform(1, 0, 0, 1, 0 - minX * scale, 0 - minY * scale);

        // Draw connection from inports to nodes
        if (this.graph.inports) {
            Object.keys(this.graph.inports).forEach( ((key) => {
                var exp = this.graph.inports[key];
                if (exp.metadata && !isNaN(exp.metadata.x) && !isNaN(exp.metadata.y)) {
                    var target = nodes[exp.process];
                    if (!target) {
                        return;
                    }
                    this.drawEdge(context, scale, exp, target, 2);
                }
            }).bind(this));
        }
        // Draw connection from nodes to outports
        if (this.graph.outports) {
            Object.keys(this.graph.outports).forEach(((key) => {
                var exp = this.graph.outports[key];
                if (exp.metadata && !isNaN(exp.metadata.x) && !isNaN(exp.metadata.y)) {
                    var source = nodes[exp.process];
                    if (!source) {
                        return;
                    }
                    this.drawEdge(context, scale, source, exp, 5);
                }
            }).bind(this));
        }

        // Draw edges
        this.graph.edges.forEach(((connection) => {
            var source = nodes[connection.from.node];
            var target = nodes[connection.to.node];
            if (!source || !target) {
                return;
            }
            this.drawEdge(context, scale, source, target, connection.metadata.route);
        }).bind(this));

        // Draw nodes
        var self = this;
        toDraw.forEach(((node) => {
            var x = Math.round(node.metadata.x * scale);
            var y = Math.round(node.metadata.y * scale);

            // Outer circle
            context.strokeStyle = self.strokeStyle;
            context.fillStyle = self.fillStyle;
            context.beginPath();
            if (node.process && !node.component) {
                context.arc(x, y, sizeHalf / 2, 0, 2 * Math.PI, false);
            } else {
                context.arc(x, y, sizeHalf, 0, 2 * Math.PI, false);
            }
            context.fill();
            context.stroke();

            // Inner circle
            context.beginPath();
            var smallRadius = Math.max(sizeHalf - 1.5, 1);
            if (node.process && !node.component) {
                // Exported port
                context.arc(x, y, smallRadius / 2, 0, 2 * Math.PI, false);
            } else {
                // Regular node
                context.arc(x, y, smallRadius, 0, 2 * Math.PI, false);
            }
            context.fill();

        }).bind(this));

    }

    
    graphChanged(oldGraph, newGraph) {
        if (!this.listener) {
            this.listener = this.redrawGraph.bind(this);
        }
        if (oldGraph) {
            oldGraph.removeListener('endTransaction', this.listener);
        }
        if (!this.graph) {
            return;
        }
        this.graph.on('endTransaction', this.listener);
        this.redrawGraph();
    }

    widthChanged () {
        this.style.width = this.width + "px";
        this.redrawGraph();
    }

    heightChanged() {
        this.style.height = this.height + "px";
        this.redrawGraph();
    }

    toDataURL() {
        return this.$.canvas.toDataURL();
    }
    
}

FlowThumb.register();