/**
 * Created by tetiana on 1/22/16.
 */
define(function() {
  /**
   *
   * @constructor
   */
  function EventMachine () {
        var funcArray={};


        /**
         * Set new event handler
         * @param events {String} - event names separated by space;
         * @param eventHandler {Function} - function that will be called when event triggers;
         * @returns {window.EventMachine}
         */
        this.on = function(events,eventHandler){
            events.split(/\s+/)
                  .forEach(function(event) {
                    !funcArray[event] ? funcArray[event]=[]:0;
                    funcArray[event].push(eventHandler);
            });
            return this;
        };

        /**
         * Remove event handler
         * @param events {String} - event names separated by space;
         * @param eventHandler {Function} - function that will be called when event triggers;
         * @returns {window.EventMachine}
         */
        this.off = function(events,eventHandler){
            events.split(/\s+/)
                  .forEach(function(event){
                    if(funcArray[event])
                funcArray[event]=funcArray[event].filter(function(handler){
                    return !(handler === eventHandler);
                });
            });
            return this;
        };

        /**
         * Call listeners of event
         * @param events {String} - event names separated by space;
         * @param parameters {Array} - array of args
         * @returns {window.EventMachine}
         */
        this.trigger = function(events,parameters){
            var that = this;
            events.split(/\s+/)
                  .forEach(function(event) {
                    if (funcArray[event]) {
                        funcArray[event].forEach(function (handler) {
                            handler.apply(that,parameters);
                        });
                    }
            });
            return this;
        };
    }

  return EventMachine;

});
