﻿
@component("my-timer")
class MyTimer extends polymer.Base {
    @property({ type: Number, value: 0 })
    start: number;

    count: number;

    private timerHandle: number;

    @property()
    firm = "Swiss clocks inc.";

    ready() {
        this.count = this.start;
        this.timerHandle = setInterval(() => {
            this.count++;
        }, 1000);
    }

    detatched() {
        clearInterval(this.timerHandle);
    }
}

MyTimer.register();