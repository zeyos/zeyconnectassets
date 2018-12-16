/**
 * Created by tetiana on 1/29/16.
 */
require.config({
    paths: {
        "d3": "../lib/d3.min",
        "text": "../lib/requirejs-text",
        "json": '../lib/requirejs-json',
        "moment": "../lib/moment",
        "moment-timezone": "../lib/moment-timezone-with-data",
        "event_machine": "../event_machine",
        "chart": "../Chart",
        "chartByDay": "../chartClasses/chartByDay",
        "gaugeChart": "../chartClasses/gaugeChart",
        "liquidFillGauge": "../chartClasses/liquidFillGauge",
        "config": "../config"
    },
    waitSeconds: 15
});