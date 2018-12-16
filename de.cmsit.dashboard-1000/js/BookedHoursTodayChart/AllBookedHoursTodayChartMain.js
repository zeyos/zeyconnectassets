/**
 * Created by tetiana on 2/25/16.
 */
require (["BookedHoursTodayChart", "json!config.json", "moment"],
    function(BookedHoursTodayChart, projectConfig, moment) {

        var todayDate = moment.utc();
        var startDate = moment.utc([todayDate.year(), todayDate.month(), todayDate.date()]),
            endDate = moment.utc([todayDate.year(), todayDate.month(), todayDate.date()]).add(23, 'hours');

        var BookedHoursByTodayParams = {
            requestUrls: [
                projectConfig.bookedHoursTodayConfig.validHoursUrl,
                projectConfig.bookedHoursTodayConfig.draftHoursUrl
            ],
            params: {
                start: startDate.unix(),
                end: endDate.unix()
            },
            type: "BookedHoursToday",
            gaugeMaxValue: ZEYOS_ALL_ACTIVE_USERS_COUNT * 8
        };

        new BookedHoursTodayChart(BookedHoursByTodayParams, "BookedHoursToday");

    });