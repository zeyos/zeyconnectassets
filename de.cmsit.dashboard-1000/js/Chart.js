/**
 * Created by tetiana on 3/10/16.
 */
define(["moment", "event_machine", "json!config.json"],
    function(moment, EventMachine, projectConfig) {

    /**
     * Class for creating the chart
     * @returns {Chart}  - chart
     * @constructor
     */
    function Chart (config) {
        EventMachine.call(this);
        var that = this;
        this.baseUrl =  projectConfig.baseUrl;
        this.proxyUrl = projectConfig.proxyUrl;
        this.data = {};
        this.requestUrls = config.requestUrls;
        this.type = config.type;
        this.method = config.method || "GET";
        this.params = config.params || {};
        this.isMinutes = config.isMinutes || false;
        this.showedDays = config.showedDays;
        this.weekStartDay = config.weekStartDay || "Mon";


        this.init = function() {
            if (this.showedDays && !this.params.length) {
                this.setParamDates(this.showedDays, this.weekStartDay);
            }
        };


        /**
         * Function for creation the url for request
         * @param url {string} - path to the server
         * @param parameters {object} - [optional argument] parameters
         * @returns {string} - generated query string
         */
        this.buildUrl = function(url, parameters){
            var params = [];
            if (Object.keys(parameters).length) {
                for(var key in parameters) {
                    if (parameters.hasOwnProperty(key)) {
                        params.push(encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key]));
                    }
                }
            }
            return (params.length) ? (url + "?" + params.join("&")) : url;
        };

        /**
         * Recursively merge properties of two objects
         * @param obj1 {object} - properties of object 1
         * @param obj2 {object} - properties of object 2
         * @returns {object} - merged object
         */
        this.mergeObjects = function(obj1, obj2) {
            for (var key in obj2) {
                if (obj2.hasOwnProperty(key)) {
                    try {
                        if (obj2[key].constructor == Object) {
                            obj1[key] = this.mergeObjects(obj1[key], obj2[key]);
                        } else {
                            obj1[key] = obj2[key];
                        }
                    } catch(e) {
                        obj1[key] = obj2[key];
                    }
                }
            }
            return obj1;
        };

        /**
         * Function for get data from server
         * @param url {string} - path to the server
         * @param method {string} - GET|PUT|POST|DELETE
         * @param params {object} - params
         * @param type {string} - type of chart
         * @param number {number} - number of request
         * @returns {string|boolean} - data that are getting from server
         */
        this.getDataFromServer = function(url, method, params, type, number) {
            this.type = type || "";
            this.number = number || 0;
            url = this.buildUrl(url, params);
            url = this.baseUrl + url;

            // just for testing
            //url = this.proxyUrl + encodeURIComponent(url);

            var xhr = this.createCORSRequest(method, url);
            if (!xhr) {
                alert("CORS not supported");
                return false;
            }
            xhr.onload = function () {
                return that.loadData(xhr);
            };
            xhr.onerror = function () {
                alert("Woops, there was an error making the request.");
            };
            xhr.send();
        };

        /**
         * Convert timestamp to the date
         * @param obj {object} - object where we want to convert timestamp
         * @param isMinutes {boolean} - if it's true - we should convert minutes to hours
         * @return {object} - object with changed date
         */
        this.toDate = function(obj, isMinutes) {
            obj.result.forEach(function(el) {
                el["key"] = new Date(1000 * el["key"]);
                if (isMinutes) {
                    if (el["value"]) {
                        el["value"] = el["value"] / 60;
                    }
                }
            });
        };

        /**
         * Create request to server
         * @param method {string} - get or post
         * @param url {string} - path to server
         * @returns {XMLHttpRequest} - created request
         */
        this.createCORSRequest = function(method, url) {
            var xhr = new XMLHttpRequest();
            if ("withCredentials" in xhr) {
                xhr.open(method, url, true);
            } else if (typeof XDomainRequest !== "undefined") {
                xhr = new XDomainRequest();
                xhr.open(method, url);
            } else {
                xhr = null;
            }
            return xhr;
        };

        /**
         * This function gat data from server if request without errors.
         * @param xhr {XMLHttpRequest} - XMLHttpRequest
         * @returns {string} - data that are getting from server
         */
        this.loadData = function(xhr) {
            var receivedData = JSON.parse(xhr.responseText);
            if (typeof receivedData.result == "object") that.toDate(receivedData, that.isMinutes);
            that.data = receivedData.result;
            that.trigger("load");
            return receivedData;
        };

        /**
         * Function for the converting JSON to the correct format
         * @param json {object} - object for converting
         * @param isWeekly {boolean} - wil the data be showing weekly or not
         * @return {object} - object
         */
        this.convertJsonToChartFormat = function(json, isWeekly) {
            var result = [],
                k = 0,
                rowCount = (isWeekly) ? (Math.floor(json.length / 7) + 1) : json.length;

            for (var i = 0; i < rowCount; i++) {
                var articles = [];
                var colCount = (isWeekly) ? 7 : json[i].stats.length;
                for (var j = 0; j < colCount; j++) {
                    var articleValue = (isWeekly) ? json[j + k] : json[i].stats[j];
                    if (articleValue) {
                        articles.push([articleValue["key"], articleValue["value"]]);
                    }
                }
                if (isWeekly) {
                    var startDate = moment(json[k].key);
                    var endDate = moment().year(startDate.year()).month(startDate.month()).date(startDate.date() + 6);
                }
                result.push({
                    articles: articles,
                    name: (isWeekly) ? "#" + endDate.isoWeek() + ", " + startDate.format("MMM D") + " - " + endDate.format("MMM D") : json[i].name
                });
                k += 7;
            }
            if (isWeekly) result.reverse();

            return result;
        };

        /**
         * Function for getting date of array
         * @param obj {object} - object for getting date
         * @return {object} - array of dates
         */
        this.getDates = function(obj) {
            return obj.map(function(el) {
                return el["key"];
            });
        };

        /**
         * Function for generate start / end date for requests
         * @param showedDays {number} - Count of days that showed on the chart
         * @param weekStartDay {number} - number of start day
         */
        this.setParamDates = function(showedDays, weekStartDay) {
            var endDate = moment.utc(),
                startDate = moment.utc([endDate.year(), endDate.month(), endDate.date()]).subtract(showedDays, 'd');

            var weekStartDay = (weekStartDay == "Mon");

            if (weekStartDay !== undefined) {
                var startDayOfWeek = startDate.day();
                switch (startDayOfWeek) {
                    case 0:
                        startDate = moment.utc([endDate.year(), endDate.month(), endDate.date()]).subtract(showedDays + 6, 'd');
                        break;
                    case 1:
                        break;
                    default:
                        startDate = moment.utc([endDate.year(), endDate.month(), endDate.date()]).subtract(showedDays + (startDayOfWeek - weekStartDay), 'd');
                }
            }


            this.params.start = startDate.unix();
            this.params.end = endDate.unix();
        };

        this.init();
        return this;
    }

    return Chart;
});

