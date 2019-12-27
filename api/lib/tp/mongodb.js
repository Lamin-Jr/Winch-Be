"use strict";

class FilterHelper {

  static buildAutocompleteFilter(textFieldName, textSearch) {
    const regex = textSearch.trim().split(/\s+/).join('|');

    const filter = {};
    filter[textFieldName] = new RegExp(regex, "i");

    return filter;
  }

}


module.exports = {
  FilterHelper
};
