import * as i0 from '@angular/core';
import { Directive, Component, ViewEncapsulation, ViewChild, ContentChild, Input, NgModule } from '@angular/core';
import * as i1 from '@angular/common';
import { CommonModule } from '@angular/common';

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function coerceBooleanProperty(value) {
    return value != null && `${value}` !== 'false';
}
function coerceNumberProperty(value, fallbackValue = 0) {
    return isNaN(parseFloat(value)) || isNaN(Number(value)) ? fallbackValue : Number(value);
}
function cssUnit(value) {
    return `${value}px`;
}
function isNumber(value) {
    return value != undefined && !isNaN(parseFloat(value)) && !isNaN(Number(value));
}

class NgxGaugeAppend {
}
NgxGaugeAppend.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NgxGaugeAppend, deps: [], target: i0.ɵɵFactoryTarget.Directive });
NgxGaugeAppend.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.9", type: NgxGaugeAppend, selector: "ngx-gauge-append", exportAs: ["ngxGaugeAppend"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NgxGaugeAppend, decorators: [{
            type: Directive,
            args: [{
                    selector: "ngx-gauge-append",
                    exportAs: "ngxGaugeAppend"
                }]
        }] });
class NgxGaugePrepend {
}
NgxGaugePrepend.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NgxGaugePrepend, deps: [], target: i0.ɵɵFactoryTarget.Directive });
NgxGaugePrepend.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.9", type: NgxGaugePrepend, selector: "ngx-gauge-prepend", exportAs: ["ngxGaugePrepend"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NgxGaugePrepend, decorators: [{
            type: Directive,
            args: [{
                    selector: "ngx-gauge-prepend",
                    exportAs: "ngxGaugePrepend"
                }]
        }] });
class NgxGaugeValue {
}
NgxGaugeValue.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NgxGaugeValue, deps: [], target: i0.ɵɵFactoryTarget.Directive });
NgxGaugeValue.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.9", type: NgxGaugeValue, selector: "ngx-gauge-value", exportAs: ["ngxGaugeValue"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NgxGaugeValue, decorators: [{
            type: Directive,
            args: [{
                    selector: "ngx-gauge-value",
                    exportAs: "ngxGaugeValue"
                }]
        }] });
class NgxGaugeLabel {
}
NgxGaugeLabel.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NgxGaugeLabel, deps: [], target: i0.ɵɵFactoryTarget.Directive });
NgxGaugeLabel.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.9", type: NgxGaugeLabel, selector: "ngx-gauge-label", exportAs: ["ngxGaugeLabel"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NgxGaugeLabel, decorators: [{
            type: Directive,
            args: [{
                    selector: "ngx-gauge-label",
                    exportAs: "ngxGaugeLabel"
                }]
        }] });

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
class NgxGauge {
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

class NgxGaugeModule {
}
NgxGaugeModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NgxGaugeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
NgxGaugeModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.9", ngImport: i0, type: NgxGaugeModule, declarations: [NgxGauge, NgxGaugeAppend, NgxGaugePrepend, NgxGaugeValue, NgxGaugeLabel], imports: [CommonModule], exports: [NgxGauge, NgxGaugeAppend, NgxGaugePrepend, NgxGaugeValue, NgxGaugeLabel] });
NgxGaugeModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NgxGaugeModule, imports: [CommonModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NgxGaugeModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule],
                    declarations: [NgxGauge, NgxGaugeAppend, NgxGaugePrepend, NgxGaugeValue, NgxGaugeLabel],
                    exports: [NgxGauge, NgxGaugeAppend, NgxGaugePrepend, NgxGaugeValue, NgxGaugeLabel]
                }]
        }] });

/*
 * Public APIs of ngx-gauge
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NgxGauge, NgxGaugeAppend, NgxGaugeLabel, NgxGaugeModule, NgxGaugePrepend, NgxGaugeValue };
//# sourceMappingURL=ngx-gauge.mjs.map
