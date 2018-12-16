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
            var user = {};
            that.number = 0;
            that.on("load", function () {
                if (that.type == "BookedHoursByUserAndWeekUser") {
                    user = that.users[that.number];
                    if (user) user.stats = that.data;
                    that.number++;
                    user = that.users[that.number];
                    if (user) {
                        that.off("load");
                        that.getDataFromServer(that.requestUrls[1] + user["name"] + "/", that.method, that.params, "BookedHoursByUserAndWeekUser", that.number);
                    } else {
                        var data = that.convertJsonToChartFormat(that.users, false);
                        that.chartByDay(data, that.getDates(that.users[0].stats), false);
                    }
                } else {
                    that.users = that.data;
                    user = that.users[that.number];
                    that.off("load");
                    if (typeof that.users == "object")
                        that.getDataFromServer(that.requestUrls[1] + user["name"] + "/", that.method, that.params, "BookedHoursByUserAndWeekUser", that.number);
                }
            });
        };

        this.chartByDay = function(chartData, headerDates, isDays) {
            new ChartByDay(this.container, chartData, headerDates, isDays);
        };

        this.init();
        return this;
    }

    return BookedHoursByUserChart;
});