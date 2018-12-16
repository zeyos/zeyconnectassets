/**
 * Created by tetiana on 2/25/16.
 */
require (["BookedHoursByUserChart", "json!config.json", "moment"],
    function(BookedHoursByUserChart, projectConfig, moment) {

        var dayCount = projectConfig.bookedHoursByUserConfig.showedDays;

        var BookedHoursByUserAndWeekParams = {
            requestUrls: [
                projectConfig.bookedHoursByUserConfig.usersUrl,
                projectConfig.bookedHoursByUserConfig.statsByUserUrl
            ],
            params: {
                start: moment.utc().subtract(dayCount, 'd').unix(),
                end: moment.utc().unix()
            },
            type: "BookedHoursByUserAndWeek",
            isMinutes: projectConfig.bookedHoursByUserConfig.showInHours
        };

        new BookedHoursByUserChart(BookedHoursByUserAndWeekParams, "BookedHoursByUserAndWeek");

    });