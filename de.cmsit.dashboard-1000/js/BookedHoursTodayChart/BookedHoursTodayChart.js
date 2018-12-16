/**
 * Created by tetiana on 3/11/16.
 */
define (["chart", "gaugeChart", "json!config.json"],
    function(Chart, GaugeChart, projectConfig) {
        "use strict";
        /**
         * Class for booked hours today chart
         * @param config {object} - config object for the chart
         * @param container {string} - name of the container
         * @returns {BookedHoursTodayChart} - methods and properties of our class
         * @constructor
         */
        function BookedHoursTodayChart(config, container) {
            var that = this;
            this.container = container;
            Chart.call(this, config);
            this.chartData = {};

            /**
             * Create the container for chart
             */
            this.init = function () {
                if (this.requestUrls.length)
                    this.getDataFromServer(this.requestUrls[0], this.method, this.params);

                this.on("load", function () {
                    that.off("load");
                    if (that.type == "draft") {
                        that.chartByToday(parseFloat(that.data[0].value || 0) + parseFloat(that.chartData.value || 0));
                    } else {
                        that.chartData = that.data[0];
                        that.getDataFromServer(that.requestUrls[1], that.method, that.params, "draft");
                    }
                });
            };

            /**
             * Function for creating the chart in the container with value
             * @param value {object} - data for the chart
             * @returns {object} - object of chart
             */
            this.chartByToday = function(value) {
                value = parseFloat((value / 60).toFixed(1));
                projectConfig.gaugeChartConfig.maxValue =
                    typeof config.gaugeMaxValue !== 'undefined' ?
                    config.gaugeMaxValue :
                    value + Math.floor((Math.random() * 20) + 1);

                var powerGauge = GaugeChart("#" + this.container, projectConfig.gaugeChartConfig);
                powerGauge.render();
                powerGauge.update(value);
                return powerGauge;
            };

            this.init();
            return this;
        }
        return BookedHoursTodayChart;
    });