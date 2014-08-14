/**
 * @fileOverview Defines the SMSound class. This sound plays audio through
 *   SoundManager2.
 */
 
var Sound = require("../Sound");
var ClassUtils = require("../../ClassUtils");
 
/**
 * SMSound objects play music through SoundManager2.
 *
 * @param {string} The URL of the music to load. This
 *   will be released when SoundManager2 no longer
 *   needs it.
 */
var SMSound = function(musicURL) {
	/** 
	 * Used to prevent soundmanager from throwing timed events that
	 * occur before the start time (e.g. if the sound is started at
	 * time 4000 instead of 0, don't throw the timed events occuring before 4000).
	 * @type {int}
	 */
	this._startTime = 0; 
    this._sound = null;
	this._url = musicURL;
    this.reset();
    if (musicURL != undefined) {
        this.load(musicURL);
    }
};

ClassUtils.extends(SMSound, Sound);

/**
 * A list of all events emitted by this class.
 * Any of these can be used as names for events in the registerEventHandler(...) method.
 * @type {Array<string>}
 */
SMSound.prototype._eventTypes = ["play", "stop", "finished", "startLoading", "finishedLoading"];

SMSound.prototype.load = function(musicURL) {
    this.stop();
    this.unload();
    var _this = this;
    this._sound = soundManager.createSound({
        url: musicURL,
        onplay: this._makeEventRouter("play"),
        onstop: this._makeEventRouter("stop"),
        onfinish: function() {_this._handleFinished();},
		onload: function() {_this._destroyURL(); _this._callEventHandler("finishedLoading"); }
    });
    this._installTimedEvents();
	this._callEventHandler("startLoading");
	this._sound.load();
};

SMSound.prototype.unload = function() {
	/**
	 * This member variable is designed to make sure that timed events are 
	 * not thrown after the music finishes. It is true when the music stops 
	 * or finishes, but false when the music is playing. Its value is used
	 * to differentiate between timed events that are thrown while the music
	 * is playing from those thrown when the music is stopped.
	 * @type {boolean}
	 */
	this._stopTimedEvents = true; 
    this._destroyURL();
	if (this._sound != null) {
        this._sound.destruct();
        this._sound = null;
		
    }
};

/**
 * Destroys the URL associated with this sound, for the sake
 * of saving space.
 */
SMSound.prototype._destroyURL = function() {
	if (this._url != null) {
		URL.revokeObjectURL(this._url);
		this._url = null;
	}
};

SMSound.prototype.reset = function() {
    this.unload();
	this._eventHandlers = [];
	for (var index = 0; index < this._eventTypes.length; index++) {
		this._eventHandlers.push(null);
	}
    this._timedEvents = [];
};

SMSound.prototype.play = function(startTime) {
	this._stopTimedEvents = false; //Timed events are allowed
    if (this._sound != null) {
		this._startTime = startTime;
        this._sound.play({position: startTime});
    }
};

SMSound.prototype.stop = function() {
	this._stopTimedEvents = true; //Don't allow any timed events to be thrown after the music is stopped
    if (this._sound != null) {
        this._sound.stop();
    }
};

SMSound.prototype.isLoaded = function() {
    return this._sound != null;
};


SMSound.prototype.isPlaying = function() {
    return (this._sound != null && this._sound.playState === 1);
};

SMSound.prototype.isReady = function() {
	return (this._sound.readyState === 3);
};

SMSound.prototype.errorFlag = function() {
	return (this._sound.readyState === 2);
};

SMSound.prototype.getError = function() {
	if (this.errorFlag()) {
		return "Sound failed to load.";
	} else {
		return null;
	}
};

/**
 * Registers an event handler, so that whenever a particular event occurs,
 * the event handler function is called.
 *
 * @param {string} eventName This is the name of the event to connect
 *   the event handler to. When this event occurs, the eventHandler will
 *   be called. Possible eventName inputs are:
 *     - "play" : occurs when the Sound begins to play
 *     - "stop" : occurs when the Sound stops playing, but NOT when the
 *         sound stops playing because it has finished
 *     - "finished" : occurs when the Sound finishes playing
 *     - "startLoading" : occurs when the Sound starts loading
 *     - "finishedLoading" : occurs when the Sound finishes loading
 * @param {function():*} eventHandler The function that will be called
 *   when the specified event occurs.
 */
Sound.prototype.registerEventHandler = function(eventName, eventHandler) {
	var handlerIndex = this._eventTypes.indexOf(eventName);
	if (handlerIndex != -1) {
		this._eventHandlers[handlerIndex] = eventHandler;
	}
};

SMSound.prototype.addTimedEvent = function(time, eventHandler) {
	var newEvent = {time: time, eventHandler: eventHandler};
    this._timedEvents.push(newEvent);
    if (this._sound != null) {
        this._installOneTimedEvent(newEvent);
    }
};

SMSound.prototype.clearTimedEvents = function() {
    for (var index = 0; index < this._timedEvents.length; index++) {
        this._sound.clearOnPosition(this._timedEvents[index].time);
    }
    this._timedEvents = [];
};

/**
 * Installs all timed events to the current soundmanager
 * sound object.
 */
SMSound.prototype._installTimedEvents = function() {
    for (var index = 0; index < this._timedEvents.length; index++) {
		this._installOneTimedEvent(this._timedEvents[index]);
    }
};

/**
 * Installs one timed event to the current soundmanager sound
 * object.
 */
SMSound.prototype._installOneTimedEvent = function(timedEvent) {
	var _this = this;
	var eventTime = timedEvent.time;
	var newEventHandler = function() {
		//If we don't add this if clause, soundmanager will throw timed 
		//events when we don't want it to (specifically, it will continue
		//to throw some events after we stop playing, and it will throw
		//events between the start of the audio and the position where
		//we started playing the audio
		if (!_this._stopTimedEvents && eventTime > _this._startTime) { 
			timedEvent.eventHandler();
		}
	}
	this._sound.onPosition(timedEvent.time, newEventHandler);
};

/**
 * Calls the event handler with the specified name, if it is set.
 *
 * @param {string} eventName The name of the event associated
 *   with the handler to call.
 */
SMSound.prototype._callEventHandler = function(eventName) {
	var index = this._eventTypes.indexOf(eventName);
    if (index != -1 && this._eventHandlers[index] != null) {
        this._eventHandlers[index]();
    }
};

/**
 * Creates a function that will respond to soundmanager object
 * events. It routes the event to an event handler, but only
 * if the event handler is set. Furthermore, the generated
 * function will always point to the event handler that
 * is currently associated with this SMSound object.
 *
 * @param {string} eventName The name of the event to route.
 * @return {function():undefined} A function that will inform
 *   an event handler about an event, if the event handler has
 *   been set.
 */
SMSound.prototype._makeEventRouter = function(eventName) {
    var _this = this;
    return function() {
        _this._callEventHandler(eventName);
    };
};

/**
 * An event handler for when the music finished.
 */
SMSound.prototype._handleFinished = function() {
	this._stopTimedEvents = true; //Make sure that no timed events are thrown after the music ends
	this._callEventHandler("finished");
};

module.exports = SMSound;