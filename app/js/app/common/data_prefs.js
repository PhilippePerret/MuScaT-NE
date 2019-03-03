'use strict'
/**
 * Données des préférences
 * =======================
 *
 *  Property `monit`    Every change should be made instantly in the
 *                      analysis table.
 *  Property `dom`      If defined, all DOMElement of this class is affected
 *                      by the change.
 *  Property `prop`     The property affected by the change. F.i. "font-size"
 *  Property `u`        Unit to add to value
 *  Property 'fct'      Function to call to apply the preference. The value of the
 *                      pref is send as first argument of the function.
 */
const DATA_PREFS = {
    preference_id: {is: 'data preference_id'}

    // --- Fenêtre des préférences ---
  , prefs_window_height:  {defValue: 460}
  , prefs_window_width:   {defValue: 800}
  , prefs_onglets_width:  {defValue: 150}

  , lang:             {defValue: 'fr', monit: true}
  , theme:            {defValue: 'muscat', monit: true}
  , default_analysis_folder: {defValue: null}
  , chord_fsize:      {defValue: 17, monit: true, tag: true, dom: '.chord', prop: 'font-size', u: 'px'}
  , harmony_fsize:    {defValue: 18, monit: true, tag: true, dom: '.harmony', prop: 'font-size', u: 'px'}
  , cadence_fsize:    {defValue: 19, monit: true, tag: true, dom: '.cadence', prop: 'font-size', u: 'px'}
  , modulation_fsize: {defValue: 20, monit: true, tag: true, dom: '.modulation', prop: 'font-size', u: 'px'}
  , part_fsize:       {defValue: 17, monit: true, tag: true, dom: '.part', prop: 'font-size', u: 'px'}
  , measure_fsize:    {defValue: 17, monit: true, tag: true, dom: '.measure', prop: 'font-size', u: 'px'}
  , degree_fsize:     {defValue: 17, monit: true, tag: true, dom: '.degree', prop: 'font-size', u: 'px'}
  , text_fsize:       {defValue: 17, monit: true, tag: true, dom: '.text.real', prop: 'font-size', u: 'px'}

  , references_lines: {defValue: false, monit: true, fct: (v) => {Page.toggle_lines_of_reference(v)}}
  , visor:            {defValue: false, monit: true}

  // --- INTERFACE ---
  , ui_code_fsize:    {defValue: 15, monit: true, dom: 'litag', prop: 'font-size', u: 'px'}

  , animation_speed:  {defValue: 50, monit: true}
}

module.exports = DATA_PREFS
