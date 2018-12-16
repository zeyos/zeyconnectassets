/**
 * Created by tetiana on 3/14/16.
 */
require (["BookedHoursByDayChart", "json!config.json",  "moment"],
    function(BookedHoursByDayChart, projectConfig) {

        var BookedHoursByDayParams = {
            requestUrls: [
                projectConfig.bookedHoursByDayConfig.myBookedHoursUrl
            ],
            showedDays: projectConfig.bookedHoursByDayConfig.showedDays, 
            isMinutes: projectConfig.bookedHoursByDayConfig.showInHours
        };

        new BookedHoursByDayChart(BookedHoursByDayParams, "BookedHoursByDay");

    });