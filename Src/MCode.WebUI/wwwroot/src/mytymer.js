var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MyTimer = (function (_super) {
    __extends(MyTimer, _super);
    function MyTimer() {
        _super.apply(this, arguments);
        this.firm = "Swiss clocks inc.";
    }
    MyTimer.prototype.ready = function () {
        var _this = this;
        this.count = this.start;
        this.timerHandle = setInterval(function () {
            _this.count++;
        }, 1000);
    };
    MyTimer.prototype.detatched = function () {
        clearInterval(this.timerHandle);
    };
    __decorate([
        property({ type: Number, value: 0 }), 
        __metadata('design:type', Number)
    ], MyTimer.prototype, "start", void 0);
    __decorate([
        property(), 
        __metadata('design:type', Object)
    ], MyTimer.prototype, "firm", void 0);
    MyTimer = __decorate([
        component("my-timer"), 
        __metadata('design:paramtypes', [])
    ], MyTimer);
    return MyTimer;
})(polymer.Base);
MyTimer.register();
