/**
 * Created by tetiana on 3/11/16.
 */
define (["chart", "chartByDay"],
    function(Chart, ChartByDay) {
    "use strict";
    /**
     * Class for creating the chart - Booked Hours By User
     * @returns {BookedHoursByUserChart}  - chart
     * @constructor
     */
    function BookedHoursByUserChart (config, container) {
        var that = this;
        this.container = container;
        Chart.call(this, config);

        /**
         * Call the methods for loading the data
         */
        this.init = function() {
            if (this.requestUrls.length)
                this.getDataFromServer(this.requestUrls[0], this.method, this.params, this.type);

            this.on("load", function () {
                that.off("load");
                if (typeof that.data == "object") {
                    that.chartByDay(
                        that.convertJsonToChartFormat(that.data, true),
                        that.getDates(that.data.slice(0, (that.data.length > 7) ? 7 : that.data.length)),
                        true
                    );
                    document.getElementById("error").classList.remove("active");
                } else {
                    document.getElementById("error").classList.add("active");
                }
            });
        };

        this.chartByDay = function(chartData, headerDates, isDays) {
            new ChartByDay(this.container, chartData, headerDates, isDays, that.weekStartDay);
        };

        this.init();
        return this;
    }

    return BookedHoursByUserChart;
});