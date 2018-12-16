/**
 * Created by tetiana on 2/25/16.
 */
require (["BookedHoursByDayChart", "json!config.json",  "moment"],
    function(BookedHoursByDayChart, projectConfig) {

        var BookedHoursByDayParams = {
            requestUrls: [
                projectConfig.bookedHoursByDayConfig.allBookedHoursUrl
            ],
            showedDays: projectConfig.bookedHoursByDayConfig.showedDays,
            isMinutes: projectConfig.bookedHoursByDayConfig.showInHours
        };

        new BookedHoursByDayChart(BookedHoursByDayParams, "BookedHoursByDay");

    });