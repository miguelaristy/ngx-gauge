/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @angular-eslint/no-host-metadata-property */
/* eslint-disable guard-for-in */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable space-before-function-paren */
/* eslint-disable no-var */
/* eslint-disable prefer-const */
/* eslint-disable one-var */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable curly */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable brace-style */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Input, ViewEncapsulation, ViewChild, ContentChild, } from "@angular/core";
import { clamp, coerceBooleanProperty, coerceNumberProperty, cssUnit, isNumber, } from "../common/util";
import { NgxGaugeLabel, NgxGaugeValue, NgxGaugePrepend, NgxGaugeAppend, } from "./gauge-directives";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
const DEFAULTS = {
    MIN: 0,
    MAX: 100,
    TYPE: "arch",
    THICK: 4,
    FOREGROUND_COLOR: "rgba(0, 150, 136, 1)",
    BACKGROUND_COLOR: "rgba(0, 0, 0, 0.1)",
    CAP: "butt",
    SIZE: 200,
};
export class NgxGauge {
    get size() {
        return this._size;
    }
    set size(value) {
        this._size = coerceNumberProperty(value);
    }
    get margin() {
        return this._margin;
    }
    set margin(value) {
        this._margin = coerceNumberProperty(value);
    }
    get min() {
        return this._min;
    }
    set min(value) {
        this._min = coerceNumberProperty(value, DEFAULTS.MIN);
    }
    get animate() {
        return this._animate;
    }
    set animate(value) {
        this._animate = coerceBooleanProperty(value);
    }
    get max() {
        return this._max;
    }
    set max(value) {
        this._max = coerceNumberProperty(value, DEFAULTS.MAX);
    }
    get value() {
        return this._value;
    }
    set value(val) {
        this._value = coerceNumberProperty(val);
    }
    constructor(_elementRef, _renderer) {
        this._elementRef = _elementRef;
        this._renderer = _renderer;
        this._size = DEFAULTS.SIZE;
        this._min = DEFAULTS.MIN;
        this._max = DEFAULTS.MAX;
        this._animate = true;
        this._margin = 0;
        this._initialized = false;
        this._animationRequestID = 0;
        this.ariaLabel = "";
        this.ariaLabelledby = null;
        this.type = DEFAULTS.TYPE;
        this.cap = DEFAULTS.CAP;
        this.thick = DEFAULTS.THICK;
        this.foregroundColor = DEFAULTS.FOREGROUND_COLOR;
        this.backgroundColor = DEFAULTS.BACKGROUND_COLOR;
        // { "40" : { color: "green", bgOpacity: .2 }, ... }
        this.thresholds = Object.create(null);
        // { "25": { color: '#ccc', type: 'line', size: 8, label: "25 lbs" }, ... }
        this.markers = Object.create(null);
        this._value = 0;
        this.duration = 1200;
    }
    ngOnInit() {
        // if markers are to be added, but no margin specified then here we add 10 px.
        if (this.markers && Object.keys(this.markers).length > 0 && !this._margin)
            this._margin = 10;
    }
    ngOnChanges(changes) {
        const isCanvasPropertyChanged = changes["thick"] || changes["type"] || changes["cap"] || changes["size"];
        const isDataChanged = changes["value"] || changes["min"] || changes["max"];
        if (this._initialized) {
            if (isDataChanged) {
                let nv, ov;
                if (changes["value"]) {
                    nv = changes["value"].currentValue;
                    ov = changes["value"].previousValue;
                }
                this._update(nv, ov);
            }
            if (isCanvasPropertyChanged) {
                this._destroy();
                this._init();
            }
        }
    }
    _updateSize() {
        this._renderer.setStyle(this._elementRef.nativeElement, "width", cssUnit(this._getWidth()));
        this._renderer.setStyle(this._elementRef.nativeElement, "height", cssUnit(this._getCanvasHeight()));
        this._canvas.nativeElement.width = this._getWidth();
        this._canvas.nativeElement.height = this._getCanvasHeight();
        this._renderer.setStyle(this._label.nativeElement, "transform", "translateY(" + ((this.size / 3) * 2 - this.size / 13 / 4) + "px)");
        this._renderer.setStyle(this._reading.nativeElement, "transform", "translateY(" + (this.size / 2 - (this.size * 0.22) / 2) + "px)");
    }
    ngAfterViewInit() {
        if (this._canvas) {
            this._init();
        }
    }
    ngOnDestroy() {
        this._destroy();
    }
    _getBounds(type) {
        let head, tail, start, end;
        if (type == "semi") {
            head = Math.PI;
            tail = 2 * Math.PI;
            start = 180;
            end = 360;
        }
        else if (type == "full") {
            head = 1.5 * Math.PI;
            tail = 3.5 * Math.PI;
            start = 270;
            end = start + 360;
        }
        else if (type === "arch") {
            head = 0.8 * Math.PI;
            tail = 2.2 * Math.PI;
            start = 180 - 0.2 * 180;
            end = 360 + 0.2 * 180;
        }
        return { head, tail, start, end };
    }
    _drawShell(start, middle, tail, color) {
        let center = this._getCenter(), radius = this._getRadius();
        if (this._initialized) {
            this._clear();
            this._drawMarkersAndTicks();
            let ranges = this._getBackgroundColorRanges();
            this._context.lineWidth = this.thick;
            if (ranges && ranges.length > 0) {
                // if background color is not specified then use default background, unless opacity is provided in which case use the color
                // and opactity against color, to form the background color.
                this._context.lineCap = "butt";
                for (let i = 0; i < ranges.length; ++i) {
                    let r = ranges[i];
                    this._context.beginPath();
                    this._context.strokeStyle = r.backgroundColor
                        ? r.backgroundColor
                        : r.bgOpacity
                            ? r.color
                            : this.backgroundColor;
                    if (r.bgOpacity !== undefined && r.bgOpacity !== null) {
                        this._context.globalAlpha = r.bgOpacity;
                    }
                    this._context.arc(center.x, center.y, radius, this._getDisplacement(r.start), this._getDisplacement(r.end), false);
                    this._context.stroke();
                    this._context.globalAlpha = 1;
                }
            }
            else {
                this._context.lineCap = this.cap;
                this._context.beginPath();
                this._context.strokeStyle = this.backgroundColor;
                this._context.arc(center.x, center.y, radius, start, tail, false);
                this._context.stroke();
            }
            this._drawFill(start, middle, tail, color);
        }
    }
    _drawFill(start, middle, tail, color) {
        let center = this._getCenter(), radius = this._getRadius();
        this._context.lineCap = this.cap;
        this._context.lineWidth = this.thick;
        middle = Math.max(middle, start); // never below 0%
        middle = Math.min(middle, tail); // never exceed 100%
        this._context.lineCap = this.cap;
        this._context.lineWidth = this.thick;
        this._context.beginPath();
        this._context.strokeStyle = color;
        this._context.arc(center.x, center.y, radius, start, middle, false);
        this._context.stroke();
    }
    _addMarker(angle, color, label, type, len, font, labelColor) {
        var rad = (angle * Math.PI) / 180;
        let offset = 2;
        if (!len)
            len = 8;
        if (!type)
            type = "line";
        let center = this._getCenter(), radius = this._getRadius();
        let x = (radius + this.thick / 2 + offset) * Math.cos(rad) + center.x;
        let y = (radius + this.thick / 2 + offset) * Math.sin(rad) + center.y;
        let x2 = (radius + this.thick / 2 + offset + len) * Math.cos(rad) + center.x;
        let y2 = (radius + this.thick / 2 + offset + len) * Math.sin(rad) + center.y;
        if (type == "triangle") {
            //Draw the triangle marker
            this._context.beginPath();
            this._context.strokeStyle = color;
            this._context.moveTo(x, y);
            this._context.lineWidth = 1;
            let a2 = angle - 45;
            let a3 = angle + 45;
            if (a2 < 0)
                a2 += 360;
            if (a2 > 360)
                a2 -= 360;
            if (a3 < 0)
                a3 += 360;
            if (a3 > 360)
                a3 -= 360;
            let rad2 = (a2 * Math.PI) / 180;
            let x3 = len * Math.cos(rad2) + x;
            let y3 = len * Math.sin(rad2) + y;
            this._context.lineTo(x3, y3);
            let rad3 = (a3 * Math.PI) / 180;
            let x4 = len * Math.cos(rad3) + x;
            let y4 = len * Math.sin(rad3) + y;
            this._context.lineTo(x4, y4);
            this._context.lineTo(x, y);
            this._context.closePath();
            this._context.stroke();
            this._context.fillStyle = color;
            this._context.fill();
        }
        else {
            //line
            this._context.beginPath();
            this._context.lineWidth = 0.5;
            this._context.strokeStyle = color;
            this._context.moveTo(x, y);
            this._context.lineTo(x2, y2);
            this._context.closePath();
            this._context.stroke();
        }
        if (label) {
            this._context.save();
            this._context.translate(x2, y2);
            this._context.rotate((angle + 90) * (Math.PI / 180));
            this._context.textAlign = "center";
            this._context.font = font ? font : "13px Arial";
            this._context.fillStyle = labelColor;
            this._context.fillText(label, 0, -3);
            this._context.restore();
        }
    }
    _clear() {
        this._context.clearRect(0, 0, this._getWidth(), this._getHeight());
    }
    _getWidth() {
        return this.size;
    }
    _getHeight() {
        return this.size;
    }
    // canvas height will be shorter for type 'semi' and 'arch'
    _getCanvasHeight() {
        return this.type == "arch" || this.type == "semi"
            ? 0.85 * this._getHeight()
            : this._getHeight();
    }
    _getRadius() {
        const center = this._getCenter();
        var rad = center.x - this.thick;
        if (this._margin > 0)
            rad -= this._margin;
        return rad;
    }
    _getCenter() {
        var x = this._getWidth() / 2, y = this._getHeight() / 2;
        return { x, y };
    }
    _init() {
        this._context = this._canvas.nativeElement.getContext("2d");
        this._initialized = true;
        this._updateSize();
        this._create();
    }
    _destroy() {
        if (this._animationRequestID) {
            window.cancelAnimationFrame(this._animationRequestID);
            this._animationRequestID = 0;
        }
        this._clear();
        this._context = null;
        this._initialized = false;
    }
    _getForegroundColorByRange(value) {
        const thresh = this._getThresholdMatchForValue(value);
        return thresh && thresh.color ? thresh.color : this.foregroundColor;
    }
    _getThresholdMatchForValue(value) {
        const match = Object.keys(this.thresholds)
            .filter(function (item) {
            return isNumber(item) && Number(item) <= value;
        })
            .sort((a, b) => Number(a) - Number(b))
            .reverse()[0];
        if (match !== undefined) {
            const thresh = this.thresholds[match];
            const t = {
                color: thresh.color,
                backgroundColor: thresh.backgroundColor,
                bgOpacity: thresh.bgOpacity,
                start: Number(match),
                end: this._getNextThreshold(Number(match)),
            };
            return t;
        }
    }
    _getNextThreshold(value) {
        const match = Object.keys(this.thresholds)
            .filter(function (item) {
            return isNumber(item) && Number(item) > value;
        })
            .sort((a, b) => Number(a) - Number(b));
        if (match && match[0] !== undefined) {
            return Number(match[0]);
        }
        else {
            return this.max;
        }
    }
    _getBackgroundColorRanges() {
        let i = 0, ranges = [];
        do {
            let thresh = this._getThresholdMatchForValue(i);
            if (thresh) {
                ranges.push({
                    start: thresh.start,
                    end: thresh.end,
                    color: thresh.color,
                    backgroundColor: thresh.backgroundColor,
                    bgOpacity: thresh.bgOpacity,
                });
                i = thresh.end;
                if (i >= this.max)
                    break;
            }
            else
                break;
        } while (true);
        return ranges;
    }
    _getDisplacement(v) {
        let type = this.type, bounds = this._getBounds(type), min = this.min, max = this.max, start = bounds.head, value = clamp(v, this.min, this.max), unit = (bounds.tail - bounds.head) / (max - min), displacement = unit * (value - min);
        return start + displacement;
    }
    _create(nv, ov) {
        let self = this, type = this.type, bounds = this._getBounds(type), duration = this.duration, min = this.min, max = this.max, value = clamp(this.value, this.min, this.max), start = bounds.head, unit = (bounds.tail - bounds.head) / (max - min), displacement = unit * (value - min), tail = bounds.tail, color = this._getForegroundColorByRange(value), startTime;
        if (self._animationRequestID) {
            window.cancelAnimationFrame(self._animationRequestID);
        }
        function animate(timestamp) {
            timestamp = timestamp || new Date().getTime();
            let runtime = timestamp - startTime;
            let progress = Math.min(runtime / duration, 1);
            let previousProgress = ov ? (ov - min) * unit : 0;
            let middle = start + previousProgress + displacement * progress;
            self._drawShell(start, middle, tail, color);
            if (self._animationRequestID && runtime < duration) {
                self._animationRequestID = window.requestAnimationFrame((timestamp) => animate(timestamp));
            }
            else {
                window.cancelAnimationFrame(self._animationRequestID);
            }
        }
        if (this._animate) {
            if (nv != undefined && ov != undefined) {
                displacement = unit * nv - unit * ov;
            }
            self._animationRequestID = window.requestAnimationFrame((timestamp) => {
                startTime = timestamp || new Date().getTime();
                animate(startTime);
            });
        }
        else {
            self._drawShell(start, start + displacement, tail, color);
        }
    }
    _drawMarkersAndTicks() {
        /*
             * example:
            this.markers = {
                '10': {
                    color: '#555',
                    size: 5,
                    label: '10',
                    font: '11px verdana'
                    type: 'line',
                },
                '20': {
                    color: '#555',
                    size: 5,
                    label: '20',
                    type: 'line',
                },
            };
            */
        if (this.markers)
            for (let mv in this.markers) {
                var n = Number(mv);
                var bounds = this._getBounds(this.type);
                var degrees = bounds.end - bounds.start;
                var perD = degrees / this.max;
                var angle = bounds.start + n * perD;
                var m = this.markers[mv];
                this._addMarker(angle, m.color, m.label, m.type, m.size, m.font, m.labelColor);
            }
    }
    _update(nv, ov) {
        this._clear();
        this._create(nv, ov);
    }
}
NgxGauge.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NgxGauge, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component });
NgxGauge.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.9", type: NgxGauge, selector: "ngx-gauge", inputs: { ariaLabel: ["aria-label", "ariaLabel"], ariaLabelledby: ["aria-labelledby", "ariaLabelledby"], size: "size", margin: "margin", min: "min", animate: "animate", max: "max", type: "type", cap: "cap", thick: "thick", label: "label", append: "append", prepend: "prepend", foregroundColor: "foregroundColor", backgroundColor: "backgroundColor", thresholds: "thresholds", markers: "markers", value: "value", duration: "duration" }, host: { attributes: { "role": "slider", "aria-readonly": "true" }, properties: { "class.ngx-gauge-meter": "true", "attr.aria-valuemin": "min", "attr.aria-valuemax": "max", "attr.aria-valuenow": "value", "attr.aria-label": "ariaLabel", "attr.aria-labelledby": "ariaLabelledby" } }, queries: [{ propertyName: "_labelChild", first: true, predicate: NgxGaugeLabel, descendants: true }, { propertyName: "_prependChild", first: true, predicate: NgxGaugePrepend, descendants: true }, { propertyName: "_appendChild", first: true, predicate: NgxGaugeAppend, descendants: true }, { propertyName: "_valueDisplayChild", first: true, predicate: NgxGaugeValue, descendants: true }], viewQueries: [{ propertyName: "_canvas", first: true, predicate: ["canvas"], descendants: true, static: true }, { propertyName: "_label", first: true, predicate: ["rLabel"], descendants: true, static: true }, { propertyName: "_reading", first: true, predicate: ["reading"], descendants: true, static: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"reading-block\" #reading [style.fontSize]=\"(size-(margin*2)) * 0.22 + 'px'\">\n  <!-- This block can not be indented correctly, because line breaks cause layout spacing, related problem: https://pt.stackoverflow.com/q/276760/2998 -->\n  <u class=\"reading-affix\" [ngSwitch]=\"_prependChild != null\"><ng-content select=\"ngx-gauge-prepend\" *ngSwitchCase=\"true\"></ng-content><ng-container *ngSwitchCase=\"false\">{{prepend}}</ng-container></u><ng-container [ngSwitch]=\"_valueDisplayChild != null\"><ng-content *ngSwitchCase=\"true\" select=\"ngx-gauge-value\"></ng-content><ng-container *ngSwitchCase=\"false\">{{value | number}}</ng-container></ng-container><u class=\"reading-affix\" [ngSwitch]=\"_appendChild != null\"><ng-content select=\"ngx-gauge-append\" *ngSwitchCase=\"true\"></ng-content><ng-container *ngSwitchCase=\"false\">{{append}}</ng-container></u>\n</div>\n<div class=\"reading-label\" #rLabel\n     [style.fontSize]=\"(size-(margin*2)) / 13 + 'px'\"\n     [ngSwitch]=\"_labelChild != null\">\n  <ng-content select=\"ngx-gauge-label\" *ngSwitchCase=\"true\"></ng-content>\n  <ng-container *ngSwitchCase=\"false\">{{label}}</ng-container>\n</div>\n<canvas #canvas></canvas>\n", styles: [".ngx-gauge-meter{display:inline-block;text-align:center;position:relative}.reading-block{position:absolute;width:100%;font-weight:400;white-space:nowrap;text-align:center;overflow:hidden;text-overflow:ellipsis}.reading-label{font-family:inherit;width:100%;display:inline-block;position:absolute;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:400}.reading-affix{text-decoration:none;font-size:.6em;opacity:.8;font-weight:200;padding:0 .18em}.reading-affix:first-child{padding-left:0}.reading-affix:last-child{padding-right:0}\n"], dependencies: [{ kind: "directive", type: i1.NgSwitch, selector: "[ngSwitch]", inputs: ["ngSwitch"] }, { kind: "directive", type: i1.NgSwitchCase, selector: "[ngSwitchCase]", inputs: ["ngSwitchCase"] }, { kind: "pipe", type: i1.DecimalPipe, name: "number" }], encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NgxGauge, decorators: [{
            type: Component,
            args: [{ selector: "ngx-gauge", host: {
                        role: "slider",
                        "aria-readonly": "true",
                        "[class.ngx-gauge-meter]": "true",
                        "[attr.aria-valuemin]": "min",
                        "[attr.aria-valuemax]": "max",
                        "[attr.aria-valuenow]": "value",
                        "[attr.aria-label]": "ariaLabel",
                        "[attr.aria-labelledby]": "ariaLabelledby",
                    }, encapsulation: ViewEncapsulation.None, template: "<div class=\"reading-block\" #reading [style.fontSize]=\"(size-(margin*2)) * 0.22 + 'px'\">\n  <!-- This block can not be indented correctly, because line breaks cause layout spacing, related problem: https://pt.stackoverflow.com/q/276760/2998 -->\n  <u class=\"reading-affix\" [ngSwitch]=\"_prependChild != null\"><ng-content select=\"ngx-gauge-prepend\" *ngSwitchCase=\"true\"></ng-content><ng-container *ngSwitchCase=\"false\">{{prepend}}</ng-container></u><ng-container [ngSwitch]=\"_valueDisplayChild != null\"><ng-content *ngSwitchCase=\"true\" select=\"ngx-gauge-value\"></ng-content><ng-container *ngSwitchCase=\"false\">{{value | number}}</ng-container></ng-container><u class=\"reading-affix\" [ngSwitch]=\"_appendChild != null\"><ng-content select=\"ngx-gauge-append\" *ngSwitchCase=\"true\"></ng-content><ng-container *ngSwitchCase=\"false\">{{append}}</ng-container></u>\n</div>\n<div class=\"reading-label\" #rLabel\n     [style.fontSize]=\"(size-(margin*2)) / 13 + 'px'\"\n     [ngSwitch]=\"_labelChild != null\">\n  <ng-content select=\"ngx-gauge-label\" *ngSwitchCase=\"true\"></ng-content>\n  <ng-container *ngSwitchCase=\"false\">{{label}}</ng-container>\n</div>\n<canvas #canvas></canvas>\n", styles: [".ngx-gauge-meter{display:inline-block;text-align:center;position:relative}.reading-block{position:absolute;width:100%;font-weight:400;white-space:nowrap;text-align:center;overflow:hidden;text-overflow:ellipsis}.reading-label{font-family:inherit;width:100%;display:inline-block;position:absolute;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:400}.reading-affix{text-decoration:none;font-size:.6em;opacity:.8;font-weight:200;padding:0 .18em}.reading-affix:first-child{padding-left:0}.reading-affix:last-child{padding-right:0}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.Renderer2 }]; }, propDecorators: { _canvas: [{
                type: ViewChild,
                args: ["canvas", { static: true }]
            }], _label: [{
                type: ViewChild,
                args: ["rLabel", { static: true }]
            }], _reading: [{
                type: ViewChild,
                args: ["reading", { static: true }]
            }], _labelChild: [{
                type: ContentChild,
                args: [NgxGaugeLabel]
            }], _prependChild: [{
                type: ContentChild,
                args: [NgxGaugePrepend]
            }], _appendChild: [{
                type: ContentChild,
                args: [NgxGaugeAppend]
            }], _valueDisplayChild: [{
                type: ContentChild,
                args: [NgxGaugeValue]
            }], ariaLabel: [{
                type: Input,
                args: ["aria-label"]
            }], ariaLabelledby: [{
                type: Input,
                args: ["aria-labelledby"]
            }], size: [{
                type: Input
            }], margin: [{
                type: Input
            }], min: [{
                type: Input
            }], animate: [{
                type: Input
            }], max: [{
                type: Input
            }], type: [{
                type: Input
            }], cap: [{
                type: Input
            }], thick: [{
                type: Input
            }], label: [{
                type: Input
            }], append: [{
                type: Input
            }], prepend: [{
                type: Input
            }], foregroundColor: [{
                type: Input
            }], backgroundColor: [{
                type: Input
            }], thresholds: [{
                type: Input
            }], markers: [{
                type: Input
            }], value: [{
                type: Input
            }], duration: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2F1Z2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtZ2F1Z2Uvc3JjL2dhdWdlL2dhdWdlLnRzIiwiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWdhdWdlL3NyYy9nYXVnZS9nYXVnZS5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUNqRCxxREFBcUQ7QUFDckQsMkRBQTJEO0FBQzNELDhEQUE4RDtBQUM5RCxpQ0FBaUM7QUFDakMsd0RBQXdEO0FBQ3hELGdEQUFnRDtBQUNoRCwyQkFBMkI7QUFDM0IsaUNBQWlDO0FBQ2pDLDRCQUE0QjtBQUM1QiwyQkFBMkI7QUFDM0IsaURBQWlEO0FBQ2pELDBCQUEwQjtBQUMxQix1REFBdUQ7QUFDdkQsOENBQThDO0FBQzlDLGdDQUFnQztBQUNoQywyREFBMkQ7QUFDM0QseURBQXlEO0FBQ3pELE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUVMLGlCQUFpQixFQU1qQixTQUFTLEVBQ1QsWUFBWSxHQUViLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFDTCxLQUFLLEVBQ0wscUJBQXFCLEVBQ3JCLG9CQUFvQixFQUNwQixPQUFPLEVBQ1AsUUFBUSxHQUNULE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxFQUNMLGFBQWEsRUFDYixhQUFhLEVBQ2IsZUFBZSxFQUNmLGNBQWMsR0FDZixNQUFNLG9CQUFvQixDQUFDOzs7QUFFNUIsTUFBTSxRQUFRLEdBQUc7SUFDZixHQUFHLEVBQUUsQ0FBQztJQUNOLEdBQUcsRUFBRSxHQUFHO0lBQ1IsSUFBSSxFQUFFLE1BQU07SUFDWixLQUFLLEVBQUUsQ0FBQztJQUNSLGdCQUFnQixFQUFFLHNCQUFzQjtJQUN4QyxnQkFBZ0IsRUFBRSxvQkFBb0I7SUFDdEMsR0FBRyxFQUFFLE1BQU07SUFDWCxJQUFJLEVBQUUsR0FBRztDQUNWLENBQUM7QUFxQkYsTUFBTSxPQUFPLFFBQVE7SUF3Qm5CLElB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QyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xDLElBQUksRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFN0IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUNoQyxJQUFJLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEMsSUFBSSxFQUFFLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWxDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRXZCLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3RCO2FBQU07WUFDTCxNQUFNO1lBRU4sSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBRWxDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FB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SSxFQUFFO2dCQUNFLE1BQU07c0JBQTVDLFNBQVM7dUJBQUMsUUFBUSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtnQkFDRyxRQUFRO3NCQUEvQyxTQUFTO3VCQUFDLFNBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7Z0JBRVQsV0FBVztzQkFBdkMsWUFBWTt1QkFBQyxhQUFhO2dCQUNJLGFBQWE7c0JBQTNDLFlBQVk7dUJBQUMsZUFBZTtnQkFDQyxZQUFZO3NCQUF6QyxZQUFZO3VCQUFDLGNBQWM7Z0JBQ0Msa0JBQWtCO3NCQUE5QyxZQUFZO3VCQUFDLGFBQWE7Z0JBWU4sU0FBUztzQkFBN0IsS0FBSzt1QkFBQyxZQUFZO2dCQUVPLGNBQWM7c0JBQXZDLEtBQUs7dUJBQUMsaUJBQWlCO2dCQUdwQixJQUFJO3NCQURQLEtBQUs7Z0JBU0YsTUFBTTtzQkFEVCxLQUFLO2dCQVNGLEdBQUc7c0JBRE4sS0FBSztnQkFRRixPQUFPO3NCQURWLEtBQUs7Z0JBU0YsR0FBRztzQkFETixLQUFLO2dCQVFHLElBQUk7c0JBQVosS0FBSztnQkFFRyxHQUFHO3NCQUFYLEtBQUs7Z0JBRUcsS0FBSztzQkFBYixLQUFLO2dCQUVHLEtBQUs7c0JBQWIsS0FBSztnQkFFRyxNQUFNO3NCQUFkLEtBQUs7Z0JBRUcsT0FBTztzQkFBZixLQUFLO2dCQUVHLGVBQWU7c0JBQXZCLEtBQUs7Z0JBRUcsZUFBZTtzQkFBdkIsS0FBSztnQkFHRyxVQUFVO3NCQUFsQixLQUFLO2dCQUdHLE9BQU87c0JBQWYsS0FBSztnQkFLRixLQUFLO3NCQURSLEtBQUs7Z0JBUUcsUUFBUTtzQkFBaEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1zaGFkb3cgKi9cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItZm9yLW9mICovXG4vKiBlc2xpbnQtZGlzYWJsZSBAYW5ndWxhci1lc2xpbnQvY29tcG9uZW50LWNsYXNzLXN1ZmZpeCAqL1xuLyogZXNsaW50LWRpc2FibGUgQGFuZ3VsYXItZXNsaW50L25vLWhvc3QtbWV0YWRhdGEtcHJvcGVydHkgKi9cbi8qIGVzbGludC1kaXNhYmxlIGd1YXJkLWZvci1pbiAqL1xuLyogZXNsaW50LWRpc2FibGUgcHJlZmVyLWFycm93L3ByZWZlci1hcnJvdy1mdW5jdGlvbnMgKi9cbi8qIGVzbGludC1kaXNhYmxlIHNwYWNlLWJlZm9yZS1mdW5jdGlvbi1wYXJlbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tdmFyICovXG4vKiBlc2xpbnQtZGlzYWJsZSBwcmVmZXItY29uc3QgKi9cbi8qIGVzbGludC1kaXNhYmxlIG9uZS12YXIgKi9cbi8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10eXBlcyAqL1xuLyogZXNsaW50LWRpc2FibGUgY3VybHkgKi9cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9tZW1iZXItb3JkZXJpbmcgKi9cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9xdW90ZXMgKi9cbi8qIGVzbGludC1kaXNhYmxlIGJyYWNlLXN0eWxlICovXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8taW5mZXJyYWJsZS10eXBlcyAqL1xuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uICovXG5pbXBvcnQge1xuICBDb21wb25lbnQsXG4gIElucHV0LFxuICBTaW1wbGVDaGFuZ2VzLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgUmVuZGVyZXIyLFxuICBBZnRlclZpZXdJbml0LFxuICBFbGVtZW50UmVmLFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgVmlld0NoaWxkLFxuICBDb250ZW50Q2hpbGQsXG4gIE9uSW5pdCxcbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE5neEdhdWdlRXJyb3IgfSBmcm9tIFwiLi9nYXVnZS1lcnJvclwiO1xuaW1wb3J0IHtcbiAgY2xhbXAsXG4gIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSxcbiAgY29lcmNlTnVtYmVyUHJvcGVydHksXG4gIGNzc1VuaXQsXG4gIGlzTnVtYmVyLFxufSBmcm9tIFwiLi4vY29tbW9uL3V0aWxcIjtcbmltcG9ydCB7XG4gIE5neEdhdWdlTGFiZWwsXG4gIE5neEdhdWdlVmFsdWUsXG4gIE5neEdhdWdlUHJlcGVuZCxcbiAgTmd4R2F1Z2VBcHBlbmQsXG59IGZyb20gXCIuL2dhdWdlLWRpcmVjdGl2ZXNcIjtcblxuY29uc3QgREVGQVVMVFMgPSB7XG4gIE1JTjogMCxcbiAgTUFYOiAxMDAsXG4gIFRZUEU6IFwiYXJjaFwiLFxuICBUSElDSzogNCxcbiAgRk9SRUdST1VORF9DT0xPUjogXCJyZ2JhKDAsIDE1MCwgMTM2LCAxKVwiLFxuICBCQUNLR1JPVU5EX0NPTE9SOiBcInJnYmEoMCwgMCwgMCwgMC4xKVwiLFxuICBDQVA6IFwiYnV0dFwiLFxuICBTSVpFOiAyMDAsXG59O1xuXG5leHBvcnQgdHlwZSBOZ3hHYXVnZVR5cGUgPSBcImZ1bGxcIiB8IFwiYXJjaFwiIHwgXCJzZW1pXCI7XG5leHBvcnQgdHlwZSBOZ3hHYXVnZUNhcCA9IFwicm91bmRcIiB8IFwiYnV0dFwiO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6IFwibmd4LWdhdWdlXCIsXG4gIHRlbXBsYXRlVXJsOiBcImdhdWdlLmh0bWxcIixcbiAgc3R5bGVVcmxzOiBbXCJnYXVnZS5jc3NcIl0sXG4gIGhvc3Q6IHtcbiAgICByb2xlOiBcInNsaWRlclwiLFxuICAgIFwiYXJpYS1yZWFkb25seVwiOiBcInRydWVcIixcbiAgICBcIltjbGFzcy5uZ3gtZ2F1Z2UtbWV0ZXJdXCI6IFwidHJ1ZVwiLFxuICAgIFwiW2F0dHIuYXJpYS12YWx1ZW1pbl1cIjogXCJtaW5cIixcbiAgICBcIlthdHRyLmFyaWEtdmFsdWVtYXhdXCI6IFwibWF4XCIsXG4gICAgXCJbYXR0ci5hcmlhLXZhbHVlbm93XVwiOiBcInZhbHVlXCIsXG4gICAgXCJbYXR0ci5hcmlhLWxhYmVsXVwiOiBcImFyaWFMYWJlbFwiLFxuICAgIFwiW2F0dHIuYXJpYS1sYWJlbGxlZGJ5XVwiOiBcImFyaWFMYWJlbGxlZGJ5XCIsXG4gIH0sXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG59KVxuZXhwb3J0IGNsYXNzIE5neEdhdWdlIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCB7XG4gIEBWaWV3Q2hpbGQoXCJjYW52YXNcIiwgeyBzdGF0aWM6IHRydWUgfSkgX2NhbnZhczogRWxlbWVudFJlZjtcbiAgQFZpZXdDaGlsZChcInJMYWJlbFwiLCB7IHN0YXRpYzogdHJ1ZSB9KSBfbGFiZWw6IEVsZW1lbnRSZWY7XG4gIEBWaWV3Q2hpbGQoXCJyZWFkaW5nXCIsIHsgc3RhdGljOiB0cnVlIH0pIF9yZWFkaW5nOiBFbGVtZW50UmVmO1xuXG4gIEBDb250ZW50Q2hpbGQoTmd4R2F1Z2VMYWJlbCkgX2xhYmVsQ2hpbGQ6IE5neEdhdWdlTGFiZWw7XG4gIEBDb250ZW50Q2hpbGQoTmd4R2F1Z2VQcmVwZW5kKSBfcHJlcGVuZENoaWxkOiBOZ3hHYXVnZVByZXBlbmQ7XG4gIEBDb250ZW50Q2hpbGQoTmd4R2F1Z2VBcHBlbmQpIF9hcHBlbmRDaGlsZDogTmd4R2F1Z2VBcHBlbmQ7XG4gIEBDb250ZW50Q2hpbGQoTmd4R2F1Z2VWYWx1ZSkgX3ZhbHVlRGlzcGxheUNoaWxkOiBOZ3hHYXVnZVZhbHVlO1xuXG4gIHByaXZhdGUgX3NpemU6IG51bWJlciA9IERFRkFVTFRTLlNJWkU7XG4gIHByaXZhdGUgX21pbjogbnVtYmVyID0gREVGQVVMVFMuTUlOO1xuICBwcml2YXRlIF9tYXg6IG51bWJlciA9IERFRkFVTFRTLk1BWDtcbiAgcHJpdmF0ZSBfYW5pbWF0ZTogYm9vbGVhbiA9IHRydWU7XG4gIHByaXZhdGUgX21hcmdpbjogbnVtYmVyID0gMDtcblxuICBwcml2YXRlIF9pbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9jb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gIHByaXZhdGUgX2FuaW1hdGlvblJlcXVlc3RJRDogbnVtYmVyID0gMDtcblxuICBASW5wdXQoXCJhcmlhLWxhYmVsXCIpIGFyaWFMYWJlbDogc3RyaW5nID0gXCJcIjtcblxuICBASW5wdXQoXCJhcmlhLWxhYmVsbGVkYnlcIikgYXJpYUxhYmVsbGVkYnk6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIEBJbnB1dCgpXG4gIGdldCBzaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3NpemU7XG4gIH1cbiAgc2V0IHNpemUodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuX3NpemUgPSBjb2VyY2VOdW1iZXJQcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cblxuICBASW5wdXQoKVxuICBnZXQgbWFyZ2luKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21hcmdpbjtcbiAgfVxuICBzZXQgbWFyZ2luKHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLl9tYXJnaW4gPSBjb2VyY2VOdW1iZXJQcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cblxuICBASW5wdXQoKVxuICBnZXQgbWluKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21pbjtcbiAgfVxuICBzZXQgbWluKHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLl9taW4gPSBjb2VyY2VOdW1iZXJQcm9wZXJ0eSh2YWx1ZSwgREVGQVVMVFMuTUlOKTtcbiAgfVxuICBASW5wdXQoKVxuICBnZXQgYW5pbWF0ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fYW5pbWF0ZTtcbiAgfVxuICBzZXQgYW5pbWF0ZSh2YWx1ZSkge1xuICAgIHRoaXMuX2FuaW1hdGUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG5cbiAgQElucHV0KClcbiAgZ2V0IG1heCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9tYXg7XG4gIH1cbiAgc2V0IG1heCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fbWF4ID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUsIERFRkFVTFRTLk1BWCk7XG4gIH1cblxuICBASW5wdXQoKSB0eXBlOiBOZ3hHYXVnZVR5cGUgPSBERUZBVUxUUy5UWVBFIGFzIE5neEdhdWdlVHlwZTtcblxuICBASW5wdXQoKSBjYXA6IE5neEdhdWdlQ2FwID0gREVGQVVMVFMuQ0FQIGFzIE5neEdhdWdlQ2FwO1xuXG4gIEBJbnB1dCgpIHRoaWNrOiBudW1iZXIgPSBERUZBVUxUUy5USElDSztcblxuICBASW5wdXQoKSBsYWJlbDogc3RyaW5nO1xuXG4gIEBJbnB1dCgpIGFwcGVuZDogc3RyaW5nO1xuXG4gIEBJbnB1dCgpIHByZXBlbmQ6IHN0cmluZztcblxuICBASW5wdXQoKSBmb3JlZ3JvdW5kQ29sb3I6IHN0cmluZyA9IERFRkFVTFRTLkZPUkVHUk9VTkRfQ09MT1I7XG5cbiAgQElucHV0KCkgYmFja2dyb3VuZENvbG9yOiBzdHJpbmcgPSBERUZBVUxUUy5CQUNLR1JPVU5EX0NPTE9SO1xuXG4gIC8vIHsgXCI0MFwiIDogeyBjb2xvcjogXCJncmVlblwiLCBiZ09wYWNpdHk6IC4yIH0sIC4uLiB9XG4gIEBJbnB1dCgpIHRocmVzaG9sZHM6IE9iamVjdCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgLy8geyBcIjI1XCI6IHsgY29sb3I6ICcjY2NjJywgdHlwZTogJ2xpbmUnLCBzaXplOiA4LCBsYWJlbDogXCIyNSBsYnNcIiB9LCAuLi4gfVxuICBASW5wdXQoKSBtYXJrZXJzOiBPYmplY3QgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIHByaXZhdGUgX3ZhbHVlOiBudW1iZXIgPSAwO1xuXG4gIEBJbnB1dCgpXG4gIGdldCB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cbiAgc2V0IHZhbHVlKHZhbDogbnVtYmVyKSB7XG4gICAgdGhpcy5fdmFsdWUgPSBjb2VyY2VOdW1iZXJQcm9wZXJ0eSh2YWwpO1xuICB9XG5cbiAgQElucHV0KCkgZHVyYXRpb246IG51bWJlciA9IDEyMDA7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZiwgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyMikge31cblxuICBuZ09uSW5pdCgpIHtcbiAgICAvLyBpZiBtYXJrZXJzIGFyZSB0byBiZSBhZGRlZCwgYnV0IG5vIG1hcmdpbiBzcGVjaWZpZWQgdGhlbiBoZXJlIHdlIGFkZCAxMCBweC5cbiAgICBpZiAodGhpcy5tYXJrZXJzICYmIE9iamVjdC5rZXlzKHRoaXMubWFya2VycykubGVuZ3RoID4gMCAmJiAhdGhpcy5fbWFyZ2luKVxuICAgICAgdGhpcy5fbWFyZ2luID0gMTA7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgY29uc3QgaXNDYW52YXNQcm9wZXJ0eUNoYW5nZWQgPVxuICAgICAgY2hhbmdlc1tcInRoaWNrXCJdIHx8IGNoYW5nZXNbXCJ0eXBlXCJdIHx8IGNoYW5nZXNbXCJjYXBcIl0gfHwgY2hhbmdlc1tcInNpemVcIl07XG4gICAgY29uc3QgaXNEYXRhQ2hhbmdlZCA9IGNoYW5nZXNbXCJ2YWx1ZVwiXSB8fCBjaGFuZ2VzW1wibWluXCJdIHx8IGNoYW5nZXNbXCJtYXhcIl07XG5cbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmIChpc0RhdGFDaGFuZ2VkKSB7XG4gICAgICAgIGxldCBudiwgb3Y7XG4gICAgICAgIGlmIChjaGFuZ2VzW1widmFsdWVcIl0pIHtcbiAgICAgICAgICBudiA9IGNoYW5nZXNbXCJ2YWx1ZVwiXS5jdXJyZW50VmFsdWU7XG4gICAgICAgICAgb3YgPSBjaGFuZ2VzW1widmFsdWVcIl0ucHJldmlvdXNWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91cGRhdGUobnYsIG92KTtcbiAgICAgIH1cbiAgICAgIGlmIChpc0NhbnZhc1Byb3BlcnR5Q2hhbmdlZCkge1xuICAgICAgICB0aGlzLl9kZXN0cm95KCk7XG4gICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVTaXplKCkge1xuICAgIHRoaXMuX3JlbmRlcmVyLnNldFN0eWxlKFxuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LFxuICAgICAgXCJ3aWR0aFwiLFxuICAgICAgY3NzVW5pdCh0aGlzLl9nZXRXaWR0aCgpKVxuICAgICk7XG4gICAgdGhpcy5fcmVuZGVyZXIuc2V0U3R5bGUoXG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsXG4gICAgICBcImhlaWdodFwiLFxuICAgICAgY3NzVW5pdCh0aGlzLl9nZXRDYW52YXNIZWlnaHQoKSlcbiAgICApO1xuICAgIHRoaXMuX2NhbnZhcy5uYXRpdmVFbGVtZW50LndpZHRoID0gdGhpcy5fZ2V0V2lkdGgoKTtcbiAgICB0aGlzLl9jYW52YXMubmF0aXZlRWxlbWVudC5oZWlnaHQgPSB0aGlzLl9nZXRDYW52YXNIZWlnaHQoKTtcbiAgICB0aGlzLl9yZW5kZXJlci5zZXRTdHlsZShcbiAgICAgIHRoaXMuX2xhYmVsLm5hdGl2ZUVsZW1lbnQsXG4gICAgICBcInRyYW5zZm9ybVwiLFxuICAgICAgXCJ0cmFuc2xhdGVZKFwiICsgKCh0aGlzLnNpemUgLyAzKSAqIDIgLSB0aGlzLnNpemUgLyAxMyAvIDQpICsgXCJweClcIlxuICAgICk7XG4gICAgdGhpcy5fcmVuZGVyZXIuc2V0U3R5bGUoXG4gICAgICB0aGlzLl9yZWFkaW5nLm5hdGl2ZUVsZW1lbnQsXG4gICAgICBcInRyYW5zZm9ybVwiLFxuICAgICAgXCJ0cmFuc2xhdGVZKFwiICsgKHRoaXMuc2l6ZSAvIDIgLSAodGhpcy5zaXplICogMC4yMikgLyAyKSArIFwicHgpXCJcbiAgICApO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIGlmICh0aGlzLl9jYW52YXMpIHtcbiAgICAgIHRoaXMuX2luaXQoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95KCk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRCb3VuZHModHlwZTogTmd4R2F1Z2VUeXBlKSB7XG4gICAgbGV0IGhlYWQsIHRhaWwsIHN0YXJ0LCBlbmQ7XG4gICAgaWYgKHR5cGUgPT0gXCJzZW1pXCIpIHtcbiAgICAgIGhlYWQgPSBNYXRoLlBJO1xuICAgICAgdGFpbCA9IDIgKiBNYXRoLlBJO1xuICAgICAgc3RhcnQgPSAxODA7XG4gICAgICBlbmQgPSAzNjA7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiZnVsbFwiKSB7XG4gICAgICBoZWFkID0gMS41ICogTWF0aC5QSTtcbiAgICAgIHRhaWwgPSAzLjUgKiBNYXRoLlBJO1xuICAgICAgc3RhcnQgPSAyNzA7XG4gICAgICBlbmQgPSBzdGFydCArIDM2MDtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiYXJjaFwiKSB7XG4gICAgICBoZWFkID0gMC44ICogTWF0aC5QSTtcbiAgICAgIHRhaWwgPSAyLjIgKiBNYXRoLlBJO1xuICAgICAgc3RhcnQgPSAxODAgLSAwLjIgKiAxODA7XG4gICAgICBlbmQgPSAzNjAgKyAwLjIgKiAxODA7XG4gICAgfVxuICAgIHJldHVybiB7IGhlYWQsIHRhaWwsIHN0YXJ0LCBlbmQgfTtcbiAgfVxuXG4gIHByaXZhdGUgX2RyYXdTaGVsbChcbiAgICBzdGFydDogbnVtYmVyLFxuICAgIG1pZGRsZTogbnVtYmVyLFxuICAgIHRhaWw6IG51bWJlcixcbiAgICBjb2xvcjogc3RyaW5nXG4gICkge1xuICAgIGxldCBjZW50ZXIgPSB0aGlzLl9nZXRDZW50ZXIoKSxcbiAgICAgIHJhZGl1cyA9IHRoaXMuX2dldFJhZGl1cygpO1xuXG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICB0aGlzLl9jbGVhcigpO1xuICAgICAgdGhpcy5fZHJhd01hcmtlcnNBbmRUaWNrcygpO1xuXG4gICAgICBsZXQgcmFuZ2VzID0gdGhpcy5fZ2V0QmFja2dyb3VuZENvbG9yUmFuZ2VzKCk7XG5cbiAgICAgIHRoaXMuX2NvbnRleHQubGluZVdpZHRoID0gdGhpcy50aGljaztcblxuICAgICAgaWYgKHJhbmdlcyAmJiByYW5nZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBpZiBiYWNrZ3JvdW5kIGNvbG9yIGlzIG5vdCBzcGVjaWZpZWQgdGhlbiB1c2UgZGVmYXVsdCBiYWNrZ3JvdW5kLCB1bmxlc3Mgb3BhY2l0eSBpcyBwcm92aWRlZCBpbiB3aGljaCBjYXNlIHVzZSB0aGUgY29sb3JcbiAgICAgICAgLy8gYW5kIG9wYWN0aXR5IGFnYWluc3QgY29sb3IsIHRvIGZvcm0gdGhlIGJhY2tncm91bmQgY29sb3IuXG4gICAgICAgIHRoaXMuX2NvbnRleHQubGluZUNhcCA9IFwiYnV0dFwiO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGxldCByID0gcmFuZ2VzW2ldO1xuICAgICAgICAgIHRoaXMuX2NvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgdGhpcy5fY29udGV4dC5zdHJva2VTdHlsZSA9IHIuYmFja2dyb3VuZENvbG9yXG4gICAgICAgICAgICA/IHIuYmFja2dyb3VuZENvbG9yXG4gICAgICAgICAgICA6IHIuYmdPcGFjaXR5XG4gICAgICAgICAgICA/IHIuY29sb3JcbiAgICAgICAgICAgIDogdGhpcy5iYWNrZ3JvdW5kQ29sb3I7XG4gICAgICAgICAgaWYgKHIuYmdPcGFjaXR5ICE9PSB1bmRlZmluZWQgJiYgci5iZ09wYWNpdHkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRleHQuZ2xvYmFsQWxwaGEgPSByLmJnT3BhY2l0eTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fY29udGV4dC5hcmMoXG4gICAgICAgICAgICBjZW50ZXIueCxcbiAgICAgICAgICAgIGNlbnRlci55LFxuICAgICAgICAgICAgcmFkaXVzLFxuICAgICAgICAgICAgdGhpcy5fZ2V0RGlzcGxhY2VtZW50KHIuc3RhcnQpLFxuICAgICAgICAgICAgdGhpcy5fZ2V0RGlzcGxhY2VtZW50KHIuZW5kKSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgKTtcbiAgICAgICAgICB0aGlzLl9jb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICAgIHRoaXMuX2NvbnRleHQuZ2xvYmFsQWxwaGEgPSAxO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9jb250ZXh0LmxpbmVDYXAgPSB0aGlzLmNhcDtcbiAgICAgICAgdGhpcy5fY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5fY29udGV4dC5zdHJva2VTdHlsZSA9IHRoaXMuYmFja2dyb3VuZENvbG9yO1xuICAgICAgICB0aGlzLl9jb250ZXh0LmFyYyhjZW50ZXIueCwgY2VudGVyLnksIHJhZGl1cywgc3RhcnQsIHRhaWwsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fY29udGV4dC5zdHJva2UoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2RyYXdGaWxsKHN0YXJ0LCBtaWRkbGUsIHRhaWwsIGNvbG9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9kcmF3RmlsbChcbiAgICBzdGFydDogbnVtYmVyLFxuICAgIG1pZGRsZTogbnVtYmVyLFxuICAgIHRhaWw6IG51bWJlcixcbiAgICBjb2xvcjogc3RyaW5nXG4gICkge1xuICAgIGxldCBjZW50ZXIgPSB0aGlzLl9nZXRDZW50ZXIoKSxcbiAgICAgIHJhZGl1cyA9IHRoaXMuX2dldFJhZGl1cygpO1xuXG4gICAgdGhpcy5fY29udGV4dC5saW5lQ2FwID0gdGhpcy5jYXA7XG4gICAgdGhpcy5fY29udGV4dC5saW5lV2lkdGggPSB0aGlzLnRoaWNrO1xuXG4gICAgbWlkZGxlID0gTWF0aC5tYXgobWlkZGxlLCBzdGFydCk7IC8vIG5ldmVyIGJlbG93IDAlXG4gICAgbWlkZGxlID0gTWF0aC5taW4obWlkZGxlLCB0YWlsKTsgLy8gbmV2ZXIgZXhjZWVkIDEwMCVcblxuICAgIHRoaXMuX2NvbnRleHQubGluZUNhcCA9IHRoaXMuY2FwO1xuICAgIHRoaXMuX2NvbnRleHQubGluZVdpZHRoID0gdGhpcy50aGljaztcblxuICAgIHRoaXMuX2NvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgdGhpcy5fY29udGV4dC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgIHRoaXMuX2NvbnRleHQuYXJjKGNlbnRlci54LCBjZW50ZXIueSwgcmFkaXVzLCBzdGFydCwgbWlkZGxlLCBmYWxzZSk7XG4gICAgdGhpcy5fY29udGV4dC5zdHJva2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FkZE1hcmtlcihhbmdsZSwgY29sb3IsIGxhYmVsPywgdHlwZT8sIGxlbj8sIGZvbnQ/LCBsYWJlbENvbG9yPykge1xuICAgIHZhciByYWQgPSAoYW5nbGUgKiBNYXRoLlBJKSAvIDE4MDtcblxuICAgIGxldCBvZmZzZXQgPSAyO1xuXG4gICAgaWYgKCFsZW4pIGxlbiA9IDg7XG5cbiAgICBpZiAoIXR5cGUpIHR5cGUgPSBcImxpbmVcIjtcblxuICAgIGxldCBjZW50ZXIgPSB0aGlzLl9nZXRDZW50ZXIoKSxcbiAgICAgIHJhZGl1cyA9IHRoaXMuX2dldFJhZGl1cygpO1xuXG4gICAgbGV0IHggPSAocmFkaXVzICsgdGhpcy50aGljayAvIDIgKyBvZmZzZXQpICogTWF0aC5jb3MocmFkKSArIGNlbnRlci54O1xuICAgIGxldCB5ID0gKHJhZGl1cyArIHRoaXMudGhpY2sgLyAyICsgb2Zmc2V0KSAqIE1hdGguc2luKHJhZCkgKyBjZW50ZXIueTtcbiAgICBsZXQgeDIgPVxuICAgICAgKHJhZGl1cyArIHRoaXMudGhpY2sgLyAyICsgb2Zmc2V0ICsgbGVuKSAqIE1hdGguY29zKHJhZCkgKyBjZW50ZXIueDtcbiAgICBsZXQgeTIgPVxuICAgICAgKHJhZGl1cyArIHRoaXMudGhpY2sgLyAyICsgb2Zmc2V0ICsgbGVuKSAqIE1hdGguc2luKHJhZCkgKyBjZW50ZXIueTtcblxuICAgIGlmICh0eXBlID09IFwidHJpYW5nbGVcIikge1xuICAgICAgLy9EcmF3IHRoZSB0cmlhbmdsZSBtYXJrZXJcbiAgICAgIHRoaXMuX2NvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICB0aGlzLl9jb250ZXh0LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgICB0aGlzLl9jb250ZXh0Lm1vdmVUbyh4LCB5KTtcblxuICAgICAgdGhpcy5fY29udGV4dC5saW5lV2lkdGggPSAxO1xuXG4gICAgICBsZXQgYTIgPSBhbmdsZSAtIDQ1O1xuICAgICAgbGV0IGEzID0gYW5nbGUgKyA0NTtcblxuICAgICAgaWYgKGEyIDwgMCkgYTIgKz0gMzYwO1xuICAgICAgaWYgKGEyID4gMzYwKSBhMiAtPSAzNjA7XG5cbiAgICAgIGlmIChhMyA8IDApIGEzICs9IDM2MDtcbiAgICAgIGlmIChhMyA+IDM2MCkgYTMgLT0gMzYwO1xuXG4gICAgICBsZXQgcmFkMiA9IChhMiAqIE1hdGguUEkpIC8gMTgwO1xuICAgICAgbGV0IHgzID0gbGVuICogTWF0aC5jb3MocmFkMikgKyB4O1xuICAgICAgbGV0IHkzID0gbGVuICogTWF0aC5zaW4ocmFkMikgKyB5O1xuICAgICAgdGhpcy5fY29udGV4dC5saW5lVG8oeDMsIHkzKTtcblxuICAgICAgbGV0IHJhZDMgPSAoYTMgKiBNYXRoLlBJKSAvIDE4MDtcbiAgICAgIGxldCB4NCA9IGxlbiAqIE1hdGguY29zKHJhZDMpICsgeDtcbiAgICAgIGxldCB5NCA9IGxlbiAqIE1hdGguc2luKHJhZDMpICsgeTtcblxuICAgICAgdGhpcy5fY29udGV4dC5saW5lVG8oeDQsIHk0KTtcbiAgICAgIHRoaXMuX2NvbnRleHQubGluZVRvKHgsIHkpO1xuXG4gICAgICB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgdGhpcy5fY29udGV4dC5zdHJva2UoKTtcblxuICAgICAgdGhpcy5fY29udGV4dC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICAgIHRoaXMuX2NvbnRleHQuZmlsbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL2xpbmVcblxuICAgICAgdGhpcy5fY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgIHRoaXMuX2NvbnRleHQubGluZVdpZHRoID0gMC41O1xuICAgICAgdGhpcy5fY29udGV4dC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuXG4gICAgICB0aGlzLl9jb250ZXh0Lm1vdmVUbyh4LCB5KTtcbiAgICAgIHRoaXMuX2NvbnRleHQubGluZVRvKHgyLCB5Mik7XG5cbiAgICAgIHRoaXMuX2NvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICB0aGlzLl9jb250ZXh0LnN0cm9rZSgpO1xuICAgIH1cblxuICAgIGlmIChsYWJlbCkge1xuICAgICAgdGhpcy5fY29udGV4dC5zYXZlKCk7XG4gICAgICB0aGlzLl9jb250ZXh0LnRyYW5zbGF0ZSh4MiwgeTIpO1xuICAgICAgdGhpcy5fY29udGV4dC5yb3RhdGUoKGFuZ2xlICsgOTApICogKE1hdGguUEkgLyAxODApKTtcbiAgICAgIHRoaXMuX2NvbnRleHQudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcbiAgICAgIHRoaXMuX2NvbnRleHQuZm9udCA9IGZvbnQgPyBmb250IDogXCIxM3B4IEFyaWFsXCI7XG4gICAgICB0aGlzLl9jb250ZXh0LmZpbGxTdHlsZSA9IGxhYmVsQ29sb3I7XG4gICAgICB0aGlzLl9jb250ZXh0LmZpbGxUZXh0KGxhYmVsLCAwLCAtMyk7XG4gICAgICB0aGlzLl9jb250ZXh0LnJlc3RvcmUoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jbGVhcigpIHtcbiAgICB0aGlzLl9jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLl9nZXRXaWR0aCgpLCB0aGlzLl9nZXRIZWlnaHQoKSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRXaWR0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5zaXplO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0SGVpZ2h0KCkge1xuICAgIHJldHVybiB0aGlzLnNpemU7XG4gIH1cblxuICAvLyBjYW52YXMgaGVpZ2h0IHdpbGwgYmUgc2hvcnRlciBmb3IgdHlwZSAnc2VtaScgYW5kICdhcmNoJ1xuICBwcml2YXRlIF9nZXRDYW52YXNIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMudHlwZSA9PSBcImFyY2hcIiB8fCB0aGlzLnR5cGUgPT0gXCJzZW1pXCJcbiAgICAgID8gMC44NSAqIHRoaXMuX2dldEhlaWdodCgpXG4gICAgICA6IHRoaXMuX2dldEhlaWdodCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UmFkaXVzKCkge1xuICAgIGNvbnN0IGNlbnRlciA9IHRoaXMuX2dldENlbnRlcigpO1xuICAgIHZhciByYWQgPSBjZW50ZXIueCAtIHRoaXMudGhpY2s7XG4gICAgaWYgKHRoaXMuX21hcmdpbiA+IDApIHJhZCAtPSB0aGlzLl9tYXJnaW47XG4gICAgcmV0dXJuIHJhZDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldENlbnRlcigpIHtcbiAgICB2YXIgeCA9IHRoaXMuX2dldFdpZHRoKCkgLyAyLFxuICAgICAgeSA9IHRoaXMuX2dldEhlaWdodCgpIC8gMjtcbiAgICByZXR1cm4geyB4LCB5IH07XG4gIH1cblxuICBwcml2YXRlIF9pbml0KCkge1xuICAgIHRoaXMuX2NvbnRleHQgPSAoXG4gICAgICB0aGlzLl9jYW52YXMubmF0aXZlRWxlbWVudCBhcyBIVE1MQ2FudmFzRWxlbWVudFxuICAgICkuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB0aGlzLl91cGRhdGVTaXplKCk7XG4gICAgdGhpcy5fY3JlYXRlKCk7XG4gIH1cblxuICBwcml2YXRlIF9kZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9hbmltYXRpb25SZXF1ZXN0SUQpIHtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9hbmltYXRpb25SZXF1ZXN0SUQpO1xuICAgICAgdGhpcy5fYW5pbWF0aW9uUmVxdWVzdElEID0gMDtcbiAgICB9XG4gICAgdGhpcy5fY2xlYXIoKTtcbiAgICB0aGlzLl9jb250ZXh0ID0gbnVsbDtcbiAgICB0aGlzLl9pbml0aWFsaXplZCA9IGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0Rm9yZWdyb3VuZENvbG9yQnlSYW5nZSh2YWx1ZSkge1xuICAgIGNvbnN0IHRocmVzaCA9IHRoaXMuX2dldFRocmVzaG9sZE1hdGNoRm9yVmFsdWUodmFsdWUpO1xuICAgIHJldHVybiB0aHJlc2ggJiYgdGhyZXNoLmNvbG9yID8gdGhyZXNoLmNvbG9yIDogdGhpcy5mb3JlZ3JvdW5kQ29sb3I7XG4gIH1cblxuICBwcml2YXRlIF9nZXRUaHJlc2hvbGRNYXRjaEZvclZhbHVlKHZhbHVlKSB7XG4gICAgY29uc3QgbWF0Y2ggPSBPYmplY3Qua2V5cyh0aGlzLnRocmVzaG9sZHMpXG4gICAgICAuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHJldHVybiBpc051bWJlcihpdGVtKSAmJiBOdW1iZXIoaXRlbSkgPD0gdmFsdWU7XG4gICAgICB9KVxuICAgICAgLnNvcnQoKGEsIGIpID0+IE51bWJlcihhKSAtIE51bWJlcihiKSlcbiAgICAgIC5yZXZlcnNlKClbMF07XG5cbiAgICBpZiAobWF0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgdGhyZXNoID0gdGhpcy50aHJlc2hvbGRzW21hdGNoXTtcbiAgICAgIGNvbnN0IHQgPSB7XG4gICAgICAgIGNvbG9yOiB0aHJlc2guY29sb3IsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogdGhyZXNoLmJhY2tncm91bmRDb2xvcixcbiAgICAgICAgYmdPcGFjaXR5OiB0aHJlc2guYmdPcGFjaXR5LFxuICAgICAgICBzdGFydDogTnVtYmVyKG1hdGNoKSxcbiAgICAgICAgZW5kOiB0aGlzLl9nZXROZXh0VGhyZXNob2xkKE51bWJlcihtYXRjaCkpLFxuICAgICAgfTtcbiAgICAgIHJldHVybiB0O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldE5leHRUaHJlc2hvbGQodmFsdWUpOiBudW1iZXIge1xuICAgIGNvbnN0IG1hdGNoID0gT2JqZWN0LmtleXModGhpcy50aHJlc2hvbGRzKVxuICAgICAgLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICByZXR1cm4gaXNOdW1iZXIoaXRlbSkgJiYgTnVtYmVyKGl0ZW0pID4gdmFsdWU7XG4gICAgICB9KVxuICAgICAgLnNvcnQoKGEsIGIpID0+IE51bWJlcihhKSAtIE51bWJlcihiKSk7XG5cbiAgICBpZiAobWF0Y2ggJiYgbWF0Y2hbMF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIE51bWJlcihtYXRjaFswXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLm1heDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXRCYWNrZ3JvdW5kQ29sb3JSYW5nZXMoKSB7XG4gICAgbGV0IGkgPSAwLFxuICAgICAgcmFuZ2VzID0gW107XG4gICAgZG8ge1xuICAgICAgbGV0IHRocmVzaCA9IHRoaXMuX2dldFRocmVzaG9sZE1hdGNoRm9yVmFsdWUoaSk7XG4gICAgICBpZiAodGhyZXNoKSB7XG4gICAgICAgIHJhbmdlcy5wdXNoKHtcbiAgICAgICAgICBzdGFydDogdGhyZXNoLnN0YXJ0LFxuICAgICAgICAgIGVuZDogdGhyZXNoLmVuZCxcbiAgICAgICAgICBjb2xvcjogdGhyZXNoLmNvbG9yLFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogdGhyZXNoLmJhY2tncm91bmRDb2xvcixcbiAgICAgICAgICBiZ09wYWNpdHk6IHRocmVzaC5iZ09wYWNpdHksXG4gICAgICAgIH0pO1xuICAgICAgICBpID0gdGhyZXNoLmVuZDtcbiAgICAgICAgaWYgKGkgPj0gdGhpcy5tYXgpIGJyZWFrO1xuICAgICAgfSBlbHNlIGJyZWFrO1xuICAgIH0gd2hpbGUgKHRydWUpO1xuXG4gICAgcmV0dXJuIHJhbmdlcztcbiAgfVxuXG4gIHByaXZhdGUgX2dldERpc3BsYWNlbWVudCh2OiBudW1iZXIpIHtcbiAgICBsZXQgdHlwZSA9IHRoaXMudHlwZSxcbiAgICAgIGJvdW5kcyA9IHRoaXMuX2dldEJvdW5kcyh0eXBlKSxcbiAgICAgIG1pbiA9IHRoaXMubWluLFxuICAgICAgbWF4ID0gdGhpcy5tYXgsXG4gICAgICBzdGFydCA9IGJvdW5kcy5oZWFkLFxuICAgICAgdmFsdWUgPSBjbGFtcCh2LCB0aGlzLm1pbiwgdGhpcy5tYXgpLFxuICAgICAgdW5pdCA9IChib3VuZHMudGFpbCAtIGJvdW5kcy5oZWFkKSAvIChtYXggLSBtaW4pLFxuICAgICAgZGlzcGxhY2VtZW50ID0gdW5pdCAqICh2YWx1ZSAtIG1pbik7XG5cbiAgICByZXR1cm4gc3RhcnQgKyBkaXNwbGFjZW1lbnQ7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGUobnY/OiBudW1iZXIsIG92PzogbnVtYmVyKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzLFxuICAgICAgdHlwZSA9IHRoaXMudHlwZSxcbiAgICAgIGJvdW5kcyA9IHRoaXMuX2dldEJvdW5kcyh0eXBlKSxcbiAgICAgIGR1cmF0aW9uID0gdGhpcy5kdXJhdGlvbixcbiAgICAgIG1pbiA9IHRoaXMubWluLFxuICAgICAgbWF4ID0gdGhpcy5tYXgsXG4gICAgICB2YWx1ZSA9IGNsYW1wKHRoaXMudmFsdWUsIHRoaXMubWluLCB0aGlzLm1heCksXG4gICAgICBzdGFydCA9IGJvdW5kcy5oZWFkLFxuICAgICAgdW5pdCA9IChib3VuZHMudGFpbCAtIGJvdW5kcy5oZWFkKSAvIChtYXggLSBtaW4pLFxuICAgICAgZGlzcGxhY2VtZW50ID0gdW5pdCAqICh2YWx1ZSAtIG1pbiksXG4gICAgICB0YWlsID0gYm91bmRzLnRhaWwsXG4gICAgICBjb2xvciA9IHRoaXMuX2dldEZvcmVncm91bmRDb2xvckJ5UmFuZ2UodmFsdWUpLFxuICAgICAgc3RhcnRUaW1lO1xuXG4gICAgaWYgKHNlbGYuX2FuaW1hdGlvblJlcXVlc3RJRCkge1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHNlbGYuX2FuaW1hdGlvblJlcXVlc3RJRCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYW5pbWF0ZSh0aW1lc3RhbXApIHtcbiAgICAgIHRpbWVzdGFtcCA9IHRpbWVzdGFtcCB8fCBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIGxldCBydW50aW1lID0gdGltZXN0YW1wIC0gc3RhcnRUaW1lO1xuICAgICAgbGV0IHByb2dyZXNzID0gTWF0aC5taW4ocnVudGltZSAvIGR1cmF0aW9uLCAxKTtcbiAgICAgIGxldCBwcmV2aW91c1Byb2dyZXNzID0gb3YgPyAob3YgLSBtaW4pICogdW5pdCA6IDA7XG4gICAgICBsZXQgbWlkZGxlID0gc3RhcnQgKyBwcmV2aW91c1Byb2dyZXNzICsgZGlzcGxhY2VtZW50ICogcHJvZ3Jlc3M7XG4gICAgICBzZWxmLl9kcmF3U2hlbGwoc3RhcnQsIG1pZGRsZSwgdGFpbCwgY29sb3IpO1xuICAgICAgaWYgKHNlbGYuX2FuaW1hdGlvblJlcXVlc3RJRCAmJiBydW50aW1lIDwgZHVyYXRpb24pIHtcbiAgICAgICAgc2VsZi5fYW5pbWF0aW9uUmVxdWVzdElEID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgodGltZXN0YW1wKSA9PlxuICAgICAgICAgIGFuaW1hdGUodGltZXN0YW1wKVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHNlbGYuX2FuaW1hdGlvblJlcXVlc3RJRCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLl9hbmltYXRlKSB7XG4gICAgICBpZiAobnYgIT0gdW5kZWZpbmVkICYmIG92ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICBkaXNwbGFjZW1lbnQgPSB1bml0ICogbnYgLSB1bml0ICogb3Y7XG4gICAgICB9XG4gICAgICBzZWxmLl9hbmltYXRpb25SZXF1ZXN0SUQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCh0aW1lc3RhbXApID0+IHtcbiAgICAgICAgc3RhcnRUaW1lID0gdGltZXN0YW1wIHx8IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBhbmltYXRlKHN0YXJ0VGltZSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5fZHJhd1NoZWxsKHN0YXJ0LCBzdGFydCArIGRpc3BsYWNlbWVudCwgdGFpbCwgY29sb3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2RyYXdNYXJrZXJzQW5kVGlja3MoKSB7XG4gICAgLypcbiAgICAgICAgICogZXhhbXBsZTpcbiAgICAgICAgdGhpcy5tYXJrZXJzID0ge1xuICAgICAgICAgICAgJzEwJzoge1xuICAgICAgICAgICAgICAgIGNvbG9yOiAnIzU1NScsXG4gICAgICAgICAgICAgICAgc2l6ZTogNSxcbiAgICAgICAgICAgICAgICBsYWJlbDogJzEwJyxcbiAgICAgICAgICAgICAgICBmb250OiAnMTFweCB2ZXJkYW5hJ1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnMjAnOiB7XG4gICAgICAgICAgICAgICAgY29sb3I6ICcjNTU1JyxcbiAgICAgICAgICAgICAgICBzaXplOiA1LFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnMjAnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgICovXG5cbiAgICBpZiAodGhpcy5tYXJrZXJzKVxuICAgICAgZm9yIChsZXQgbXYgaW4gdGhpcy5tYXJrZXJzKSB7XG4gICAgICAgIHZhciBuID0gTnVtYmVyKG12KTtcbiAgICAgICAgdmFyIGJvdW5kcyA9IHRoaXMuX2dldEJvdW5kcyh0aGlzLnR5cGUpO1xuICAgICAgICB2YXIgZGVncmVlcyA9IGJvdW5kcy5lbmQgLSBib3VuZHMuc3RhcnQ7XG4gICAgICAgIHZhciBwZXJEID0gZGVncmVlcyAvIHRoaXMubWF4O1xuICAgICAgICB2YXIgYW5nbGUgPSBib3VuZHMuc3RhcnQgKyBuICogcGVyRDtcblxuICAgICAgICB2YXIgbSA9IHRoaXMubWFya2Vyc1ttdl07XG4gICAgICAgIHRoaXMuX2FkZE1hcmtlcihhbmdsZSwgbS5jb2xvciwgbS5sYWJlbCwgbS50eXBlLCBtLnNpemUsIG0uZm9udCwgbS5sYWJlbENvbG9yKTtcbiAgICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZShudjogbnVtYmVyLCBvdjogbnVtYmVyKSB7XG4gICAgdGhpcy5fY2xlYXIoKTtcbiAgICB0aGlzLl9jcmVhdGUobnYsIG92KTtcbiAgfVxufVxuIiwiPGRpdiBjbGFzcz1cInJlYWRpbmctYmxvY2tcIiAjcmVhZGluZyBbc3R5bGUuZm9udFNpemVdPVwiKHNpemUtKG1hcmdpbioyKSkgKiAwLjIyICsgJ3B4J1wiPlxuICA8IS0tIFRoaXMgYmxvY2sgY2FuIG5vdCBiZSBpbmRlbnRlZCBjb3JyZWN0bHksIGJlY2F1c2UgbGluZSBicmVha3MgY2F1c2UgbGF5b3V0IHNwYWNpbmcsIHJlbGF0ZWQgcHJvYmxlbTogaHR0cHM6Ly9wdC5zdGFja292ZXJmbG93LmNvbS9xLzI3Njc2MC8yOTk4IC0tPlxuICA8dSBjbGFzcz1cInJlYWRpbmctYWZmaXhcIiBbbmdTd2l0Y2hdPVwiX3ByZXBlbmRDaGlsZCAhPSBudWxsXCI+PG5nLWNvbnRlbnQgc2VsZWN0PVwibmd4LWdhdWdlLXByZXBlbmRcIiAqbmdTd2l0Y2hDYXNlPVwidHJ1ZVwiPjwvbmctY29udGVudD48bmctY29udGFpbmVyICpuZ1N3aXRjaENhc2U9XCJmYWxzZVwiPnt7cHJlcGVuZH19PC9uZy1jb250YWluZXI+PC91PjxuZy1jb250YWluZXIgW25nU3dpdGNoXT1cIl92YWx1ZURpc3BsYXlDaGlsZCAhPSBudWxsXCI+PG5nLWNvbnRlbnQgKm5nU3dpdGNoQ2FzZT1cInRydWVcIiBzZWxlY3Q9XCJuZ3gtZ2F1Z2UtdmFsdWVcIj48L25nLWNvbnRlbnQ+PG5nLWNvbnRhaW5lciAqbmdTd2l0Y2hDYXNlPVwiZmFsc2VcIj57e3ZhbHVlIHwgbnVtYmVyfX08L25nLWNvbnRhaW5lcj48L25nLWNvbnRhaW5lcj48dSBjbGFzcz1cInJlYWRpbmctYWZmaXhcIiBbbmdTd2l0Y2hdPVwiX2FwcGVuZENoaWxkICE9IG51bGxcIj48bmctY29udGVudCBzZWxlY3Q9XCJuZ3gtZ2F1Z2UtYXBwZW5kXCIgKm5nU3dpdGNoQ2FzZT1cInRydWVcIj48L25nLWNvbnRlbnQ+PG5nLWNvbnRhaW5lciAqbmdTd2l0Y2hDYXNlPVwiZmFsc2VcIj57e2FwcGVuZH19PC9uZy1jb250YWluZXI+PC91PlxuPC9kaXY+XG48ZGl2IGNsYXNzPVwicmVhZGluZy1sYWJlbFwiICNyTGFiZWxcbiAgICAgW3N0eWxlLmZvbnRTaXplXT1cIihzaXplLShtYXJnaW4qMikpIC8gMTMgKyAncHgnXCJcbiAgICAgW25nU3dpdGNoXT1cIl9sYWJlbENoaWxkICE9IG51bGxcIj5cbiAgPG5nLWNvbnRlbnQgc2VsZWN0PVwibmd4LWdhdWdlLWxhYmVsXCIgKm5nU3dpdGNoQ2FzZT1cInRydWVcIj48L25nLWNvbnRlbnQ+XG4gIDxuZy1jb250YWluZXIgKm5nU3dpdGNoQ2FzZT1cImZhbHNlXCI+e3tsYWJlbH19PC9uZy1jb250YWluZXI+XG48L2Rpdj5cbjxjYW52YXMgI2NhbnZhcz48L2NhbnZhcz5cbiJdfQ==