/* 
 *  WxFramework all rights reserved to J.Demk <demjot at eti.pg.gda.pl>
 */
'use strict';

Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
/**
 * Object that can be observed
 * @param {type} value
 * @returns {ObservableVar}
 */
function ObservableVar(value) {
    this.value = value;
    this.observators = [];
}

ObservableVar.prototype = {
    constructor: ObservableVar,
    changed: function () {
        for (var i = 0; i < this.observators.length; i++) {
            this.observators[i].update(this.value);
        }
        return this;
    },
    getValue: function () {
        return this.value;
    },
    setValue: function (value) {
        this.value = value;
        this.changed();
        return this;
    },
    addObservator: function (observator) {
        if (!(observator instanceof Observator)) {
            console.error('Nieprawidłowy typ obserwatora');
            return false;
        }
        if (this.observators.indexOf(observator) === -1) {
            this.observators.push(observator);
        }
        return this;
    },
    removeObservator: function (observator) {
        if (!(observator instanceof Observator)) {
            console.error('Nieprawidłowy typ obserwatora');
            return false;
        }
        this.observators.remove(observator);
    }
};


/**
 * Observator, automatically watches observableElement
 * @param {ObservableVar} observableElement element to observe
 * @param {function} update Function(newVal) colled after change in observableElement
 * @returns {Observator|Boolean}
 */
function Observator(observableElement, update) {
    if (!(observableElement instanceof ObservableVar)) {
        console.error('Nieprawidłowy typ elementu obserwowalnego');
        return false;
    }
    this.update = update;
    this.observableElement = observableElement;
    observableElement.addObservator(this);
    return this;
}

Observator.prototype = {
    constructor: Observator,
    observe: function (observableElement) {
        this.observableElement = observableElement;
        this.observableElement.addObservator(this);
        return this;
    },
    release: function () {
        if (this.observableElement !== null) {
            this.observableElement.removeObservator(this);
            this.observableElement = null;
        }
        return this;
    },
    update: null
};


