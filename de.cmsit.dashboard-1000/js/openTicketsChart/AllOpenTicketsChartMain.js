/**
 * Created by tetiana on 2/25/16.
 */
require (["OpenTicketsChart" , "json!config.json"],
    function(OpenTicketsChart, projectConfig) {

        var NumberOfOpenTicketsParams = {
            requestUrls: [projectConfig.openTicketsConfig.allOpenTicketsUrl]
        };

        new OpenTicketsChart(NumberOfOpenTicketsParams, "NumberOfOpenTickets");

    });