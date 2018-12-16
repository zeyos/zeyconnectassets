/**
 * Created by tetiana on 3/11/16.
 */
define (["chart", "liquidFillGauge", "json!config.json"],
    function(Chart, LiquidFillGaugeClass, projectConfig) {
    "use strict";
    /**
     * Class for creating the chart - Open Tickets
     * @returns {OpenTicketsChart}  - chart
     * @constructor
     */
    function OpenTicketsChart (config, container) {
        var that = this;
        this.container = container;
        Chart.call(this, config);

        /**
         * Call the methods for loading the data
         */
        this.init = function() {
            if (this.requestUrls.length)
                this.getDataFromServer(this.requestUrls[0], this.method, this.params);

            this.on("load", function () {
                that.off("load");
                that.liquidFillGaugeChart(that.data || 0);
            });
        };

        /**
         * Function for creating the chart in the container with value
         * @param value {number} - number for the chart
         * @returns {object} - object of chart
         */
        this.liquidFillGaugeChart = function(value) {

            var amountDependentColor = projectConfig.amountDependentColor,
                liquidFillGaugeClass = new LiquidFillGaugeClass(),
                config = liquidFillGaugeClass.liquidFillGaugeDefaultSettings();

            that.mergeObjects(config, projectConfig.liquidFillGaugeChartConfig);
            amountDependentColor.some(function(el) {
                if (typeof el == "string") {
                    return that.mergeObjects(config, projectConfig.openTicketsColors[el]);
                } else {
                    if (value <= el[0]) {
                        return that.mergeObjects(config, projectConfig.openTicketsColors[el[1]]);
                    }
                }
            });
            return liquidFillGaugeClass.loadLiquidFillGauge(this.container, value, config);
        };

        this.init();
        return this;
    }

    return OpenTicketsChart;
});