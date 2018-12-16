/**
 * Created by tetiana on 1/29/16.
 */
define(["d3", "moment"], function(d3, moment) {
    function ChartByDay(container, chartData, headerDates, isTickDays, weekStartDay) {
        this.container = container;
        this.data = chartData;
        this.arrayOfDates = headerDates;
        this.weekStartDay = weekStartDay || "Mon";
        var that = this;

        /**
         * Initialize function for this class
         */
        this.init = function() {
            this.renderChart(this.container, this.data);
        };

        /**
         * Get part of string
         * @param str {string} - string for getting the part of it
         * @param maxLength {number} - count of letters in string
         * @param suffix {string} - suffix
         * @returns {string} - changed string
         */
        this.truncate = function(str, maxLength, suffix) {
            if(str.length > maxLength) {
                str = str.substring(0, maxLength + 1);
                str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
                str = str + suffix;
            }
            return str;
        };

        /**
         * Render chart
         * @param container {string} - name of container where should be located the chart
         * @param data {object} - data for the chart
         */
        this.renderChart = function(container, data) {

            //Chart sizes
            var margin = {top: 50, right: 140, bottom: 0, left: 10},
                width = document.getElementById(container).offsetWidth - 190,
                height = 250;

            if (isTickDays) {
                margin.right = 20;
                margin.left = 140;
            }

            //set maximum radius for the circles
            var maxRadius = 12;

            // Generate a color scale
            var color = d3.scale.category20c();

            //Is Days in ticks
            //Set start/end date for the chart header
            var startDate = new Date(that.arrayOfDates[0]),
                endDate = new Date(that.arrayOfDates[that.arrayOfDates.length - 1]);

            if (isTickDays) {
                startDate = 0;
                endDate = 6;
            }

            //Set header and position for it: top
            var x = d3.time.scale()
                .rangeRound([0, width]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("top");

            //Set format for the chart header
            if (isTickDays) {
                var week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                if (weekStartDay == "Sun") {
                    week.unshift(week.pop());
                }
                xAxis.tickValues(this.arrayOfDates).tickFormat(function(d, i) {
                    return week[i];
                });
            } else {
                xAxis.tickValues(this.arrayOfDates).tickFormat(function(d) {
                    var today = new Date();
                    var date = new Date(d);
                    if (today.getDate() == date.getDate() && today.getMonth() == date.getMonth()) {
                        return "Today";
                    } else {
                        return moment(d).format("MMM D");
                    }
                });
            }

            //Add chart to th container
            var marginStyle = "margin-left",
                marginVelue = margin.left + "px";

            if (isTickDays) {
                marginStyle = "margin-right";
                marginVelue = margin.right + "px";
            }

            var svg = d3.select("#" + container).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .style(marginStyle, marginVelue)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //Set dates to the header
            x.domain([new Date(that.arrayOfDates[0]), new Date(that.arrayOfDates[that.arrayOfDates.length - 1])]);
            var xScale = d3.scale.linear()
                .domain([startDate, endDate])
                .range([0, width]);

            //Add header to the container
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + 0 + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "3.5em")
                .attr("dy", "0")
                .attr("y", "3")
                .attr("transform", "rotate(-90)");;

            //Draw data in the chart
            for (var j = 0; j < data.length; j++) {

                //get username and data by user
                var articles = data[j]['articles'],
                    userName = data[j]['name'];

                var g = svg.append("g").attr("class","journal");

                //draw every point in the chart
                for (var i = 0; i < articles.length; i++) {
                    //declare circles
                    var circles = g.selectAll("circle")
                        .data(articles)
                        .enter()
                        .append("circle");

                    //declare text for the circles
                    var text = g.selectAll("text")
                        .data(articles)
                        .enter()
                        .append("text");

                    //scale circles according to the maximum radius
                    var rScale = d3.scale.linear()
                        .domain([0, maxRadius])
                        .range([0, 9]);

                    //cx - horizontal position of circle
                    //cy - vertical position of circle
                    //r - radius of circle
                    //fill - color of circle
                    circles
                        .attr("cx", function(d) {

                            if (isTickDays) {
                                if (that.weekStartDay == "Mon") {
                                    var weekday = (new Date(d[0])).getDay() - 1;
                                    if (weekday < 0) weekday = 6;
                                    return xScale(weekday);
                                } else {
                                    return xScale((new Date(d[0])).getDay());
                                }
                            } else {
                                return xScale(new Date(d[0]));
                            }

                        })
                        .attr("cy", j*20+20)
                        .attr("r", function(d) { return rScale( ( (d[1] > maxRadius) ? maxRadius: d[1]) ); })
                        .style("fill", function() { return color(j); });

                    //x - horizontal position of text
                    //y - vertical position of text
                    //class - set attribute "class" for the text
                    //text - set value that showed on hover
                    //fill - color of text
                    text
                        .attr("y", j*20+25)
                        .attr("x",function(d) {
                            var shiftTextValue = (d[1]) ? 9 : 3;
                            if (isTickDays) {
                                if (that.weekStartDay == "Mon") {
                                    var weekday = (new Date(d[0])).getDay() - 1;
                                    if (weekday < 0) weekday = 6;
                                    return xScale(weekday) - shiftTextValue;
                                } else {
                                    return xScale((new Date(d[0])).getDay()) - shiftTextValue;
                                }
                            } else {
                                return xScale(new Date(d[0])) - shiftTextValue;
                            }

                        })
                        .attr("class","value")
                        .text(function(d){
                            if (d[1]) {
                                var hrs = parseInt(Number(d[1]));
                                var min = Math.round((Number(d[1])-hrs) * 60);
                                return hrs + ':' + ((!min) ? min + "0" : min);
                            }
                            return 0;
                        })
                        .style("fill", function(d) {
                            if (d[1] == 0) {
                                return "#d3d3d3";
                            }
                            return color(j);
                        })
                        .style("display","none");
                }

                //Set styles, location for the username
                g.append("text")
                    .attr("y", j*20+25)
                    .attr("x", (isTickDays) ? -140 : width + 20)
                    .attr("class","label")
                    .text(that.truncate(userName,30,"..."))
                    .style("fill", function() { return color(j); })
                    .on("mouseover", mouseOver)
                    .on("mouseout", mouseOut);
            }

            function mouseOver() {
                var g = d3.select(this).node().parentNode;
                d3.select(g).selectAll("circle").style("display","none");
                d3.select(g).selectAll("text.value").style("display","block");
            }

            function mouseOut() {
                var g = d3.select(this).node().parentNode;
                d3.select(g).selectAll("circle").style("display","block");
                d3.select(g).selectAll("text.value").style("display","none");
            }
        };

        this.init();
        return this;
    }

    return ChartByDay;
});