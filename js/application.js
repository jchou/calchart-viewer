var ApplicationController = require("./viewer/ApplicationController");

/**
 * This function will be executed by jQuery when the HTML DOM is loaded. Here,
 * we should instantiate the ApplicationController and bind the necessary click
 * events on elements.
 *
 * @todo: implement the Calchart Viewer app here
 */
$(document).ready(function () {
    var applicationController = ApplicationController.getInstance();
    applicationController.init();

    // bindings for file uploads
    $(".js-beats-file-btn").click(function() {
        $(".js-beats-file").click();
    });
    $(".js-beats-file").change(applicationController.getBeatsFileHandler());

    $(".js-viewer-file-btn").click(function() {
        $(".js-viewer-file").click();
    });
    $(".js-viewer-file").change(applicationController.getViewerFileHandler());

    $(".js-audio-file-btn").click(function() {
        $(".js-audio-file").click();
    });
    $(".js-audio-file").change(applicationController.getMusicFileHandler());

    // bindings for user interface components
    $(".js-prev-beat").click(function () {
        applicationController.applyAnimationAction("prevBeat");
    });
    $(".js-prev-stuntsheet").click(function () {
        applicationController.applyAnimationAction("prevSheet");
    });
    $(".js-next-beat").click(function () {
        applicationController.applyAnimationAction("nextBeat");
    });
    $(".js-next-stuntsheet").click(function () {
        applicationController.applyAnimationAction("nextSheet");
    });

    // global window actions for detecting arrow key presses
    $(window).keydown(function (event) {
        if (event.keyCode === 39) { // right arrow
            applicationController.applyAnimationAction("nextBeat");
        } else if (event.keyCode === 37) { // left arrow
            applicationController.applyAnimationAction("prevBeat");
        } else if (event.keyCode === 32) { // space
            var _animator = applicationController.getAnimator();
            if (_animator && _animator.isReady()) {
                applicationController.toggleAnimation();
            }
        }
    });

    $(".js-animate").click(function () {
        applicationController.toggleAnimation();
    });

    // for testing PDF
    window.pdf = function() {
        if ($(".js-dot-labels").val() === "") {
            var dot = applicationController.getShow().getDotLabels()[0];
            $(".js-dot-labels").trigger('change', {selected:dot});
        }
        applicationController.generatePDF();
    };
    $(".js-generate-continuity").click(function () {
        if (!$(this).hasClass("disabled")) {
            applicationController.generatePDF();
        }
    });
    
    $(".js-dot-labels").chosen({
        allow_single_deselect: true,
        width: "90px"
    }).change(function(evt, params){
        if (typeof params === "undefined") {
            applicationController.applyAnimationAction("clearSelectedDot");
        } else {
            applicationController.applyAnimationAction("selectDot", params.selected);
        }
    });

    applicationController.getShows(2014);

    $(".js-select-show")
        .chosen({
            width: "150px",
            disable_search_threshold: 4 // if there are less than 4 shows, hide search
        })
        .change(function(evt, params) {
            applicationController.autoloadShow(params.selected);
        });
});