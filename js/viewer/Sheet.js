/**
 * @fileOverview Defines the Sheet class.
 */

/**
 * Sheets represent stuntsheets in a show. Each has a collection of
 * all of the Dots involved in its formations, and those Dots,
 * in turn, know their positions and orientations for all beats during
 * the Sheet's duration.
 *
 * @param {string} label The label/name for the sheet.
 * @param {string} fieldType A string that indicates the type of field that this sheet
 *   is performed on.
 * @param {Array<string>} dotTypes An array of all dot types used in this sheet.
 * @param {object} dotTypeAssignments An object that maps each dot label to the dot type
 *   associated with that dot.
 * @param {object} continuityTexts An object that maps each dot type to an array
 *   containing all of the continuity instructions associated with that dot type.
 * @param {int} duration The duration of the sheet, in beats.
 * @param {Array<Dot>} dots An array of all dots involved in this sheet's
 *   movements. Note that all of these dots already have their
 *   MovementCommands before the Sheet is constructed.
 * @param {Array<string>} dotLabels an array, in sync with dots, which specifies the
 *   dot labels of the dots
 */
var Sheet = function(sheetLabel, fieldType, dotTypes, dotTypeAssignments, continuityTexts, duration, dots, dotLabels) {
    this._sheetLabel = sheetLabel;
    this._fieldType = fieldType;
    this._dotTypes = dotTypes;
    this._dotTypeAssignments = dotTypeAssignments;
    this._continuityTexts = continuityTexts;
    this._duration = duration;
    this._dots = dots;
    this._dotLabels = dotLabels;
};

/**
 * Returns the sheet's label.
 *
 * @return {string} The sheet's label.
 */
Sheet.prototype.getSheetLabel = function() {
    return this._sheetLabel;
};

/**
 * Returns the type of field that this sheet is performed on.
 *
 * @return {string} A string that indicates what kind of field
 *   the sheet is performed on.
 */
Sheet.prototype.getFieldType = function() {
    return this._fieldType;
};

/**
 * Returns an array of all dot types involved with this
 * sheet.
 *
 * @return {Array<string>} An array of all dot types involved in
 *   this sheet. Dot types are given as strings.
 */
Sheet.prototype.getAllDotTypes = function() {
    return this._dotTypes;
};

/**
 * Returns the dot type associated with a particular
 * dot.
 *
 * @param {string} dotLabel The label of the dot whose
 *   dot type will be returned.
 * @return {string} The dot label of the specified dot.
 */
Sheet.prototype.getDotType = function(dotLabel) {
    return this._dotTypeAssignments[dotLabel];
};

/**
 * Returns an array containing the continuities associated
 * with a particular dot type. Each continuity is a human-readable
 * instruction as would appear on a printed version of a stuntsheet.
 *
 * @param {string} dotType The dot type to retrieve continuities for.
 * @return {Array<string>} An array containing all continuities associated
 *   with the specified dot type. Each continuity is a human-readable
 *   text instruction.
 */
Sheet.prototype.getContinuityTexts = function(dotType) {
    return this._continuityTexts[dotType];
};

/**
 * Returns an array of all dots involved in this sheet's movements.
 *
 * @return {Array<Dot>} An array of all dots involved in this sheet's
 *   movements.
 */
Sheet.prototype.getDots = function() {
    return this._dots;
};

/**
 * Get a dot in this sheet by its dot label.
 * @param  {string} dotLabel the dots label, e.g. "A1" or "15"
 * @return {Dot|null} the dot, or null if a dot with the given label does not
 *   exist in the sheet
 */
Sheet.prototype.getDotByLabel = function (dotLabel) {
    var index = this._dotLabels.indexOf(dotLabel);
    if (index === -1) {
        return null;
    }
    return this._dots[index];
};

/**
 * Returns the duration of this sheet, in beats.
 *
 * @return {int} The duration of this sheet, in beats.
 */
Sheet.prototype.getDuration = function() {
    return this._duration;
};

module.exports = Sheet;